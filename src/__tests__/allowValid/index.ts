import { existsSync, readFileSync, rmdirSync } from 'fs';

import { convertFromDirectory, convertSchema } from '../../index';
import Joi from 'joi';

const typeOutputDirectory = './src/__tests__/allowValid/interfaces';

describe('union types using allow()', () => {
  beforeAll(() => {
    if (existsSync(typeOutputDirectory)) {
      rmdirSync(typeOutputDirectory, { recursive: true });
    }
  });

  test('many variations of `allow()`', () => {
    // allowing an empty string is still just a string
    const schema = Joi.object({
      name: Joi.string().optional().description('Test Schema Name').allow(''),
      nullName: Joi.string().optional().description('nullable').allow(null),
      blankNull: Joi.string().optional().allow(null, ''),
      blank: Joi.string().allow(''),
      normalList: Joi.string().allow('red', 'green', 'blue'),
      normalRequiredList: Joi.string().allow('red', 'green', 'blue').required(),
      numbers: Joi.number().optional().allow(1, 2, 3, 4, 5),
      nullNumber: Joi.number().optional().allow(null),
      date: Joi.date().allow(null).description('This is date')
    })
      .meta({ className: 'TestSchema' })
      .description('a test schema definition');

    const result = convertSchema({ sortPropertiesByName: false }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface TestSchema {
  /**
   * Test Schema Name
   */
  name?: string;
  /**
   * nullable
   */
  nullName?: string | null;
  blankNull?: string | null | '';
  blank?: string;
  normalList?: 'red' | 'green' | 'blue';
  normalRequiredList: 'red' | 'green' | 'blue';
  numbers?: 1 | 2 | 3 | 4 | 5;
  nullNumber?: number | null;
  /**
   * This is date
   */
  date?: Date | null;
}`);
  });

  test('test an invalid variation of `allow()`', () => {
    expect(() => {
      const invalidSchema = Joi.object({
        blankNullUndefined: Joi.string().optional().allow(null, '', undefined),
        blankNullUndefinedRequired: Joi.string().required().allow(null, '', undefined)
      })
        .meta({ className: 'TestSchema' })
        .description('a test schema definition');

      const invalidResult = convertSchema({}, invalidSchema);
      // eslint-disable-next-line no-console
      console.log(invalidResult);
    }).toThrow();
  });

  test('null `allow()`', () => {
    const schema = Joi.object({
      obj: Joi.object().allow(null),
      arr: Joi.array().items(Joi.string()).allow(null),
      // then some tests for things you can do but probably shouldnt
      sillyProperty: Joi.object().allow(null, 'joe'),
      sillyArray: Joi.array().items(Joi.string()).allow(null, 'fred')
    }).meta({ className: 'TestSchema' });

    const result = convertSchema({ sortPropertiesByName: false }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`export interface TestSchema {
  obj?: object | null;
  arr?: string[] | null;
  sillyProperty?: object | null | 'joe';
  sillyArray?: string[] | null | 'fred';
}`);
  });

  test('object allow null on complex type', async () => {
    const result = await convertFromDirectory({
      schemaDirectory: './src/__tests__/allowValid/schemas',
      typeOutputDirectory
    });

    expect(result).toBe(true);

    const oneContent = readFileSync(`${typeOutputDirectory}/Parent.ts`).toString();

    expect(oneContent).toBe(
      `/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface Child {
  item: number;
}

export interface Parent {
  child: Child | null;
}
`
    );
  });

  test('Enum `allow()`', () => {
    enum Test {
      Option1 = 0,
      Option2 = 1,
      Option3 = 2
    }

    const schema = Joi.object({
      enumeration: Joi.allow(...Object.values(Test))
    }).meta({ className: 'TestSchema' });

    const result = convertSchema({ sortPropertiesByName: false }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`export interface TestSchema {
  enumeration?: 'Option1' | 'Option2' | 'Option3' | 0 | 1 | 2;
}`);
  });

  test('allow joi.ref dont crash', () => {
    const schema = Joi.object()
      .label('SignUp')
      .keys({
        password: Joi.string()
          .required()
          .description('The password of the authenticating user')
          .example('test-PASSWORD123'),
        repeatPassword: Joi.string()
          .required()
          .allow(Joi.ref('password'))
          .description('Repeat the password to ensure no typos')
          .example('test-PASSWORD123')
      })
      .meta({ className: 'TestSchema' });

    const result = convertSchema({}, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`export interface TestSchema {
  /**
   * The password of the authenticating user
   * @example test-PASSWORD123
   */
  password: string;
  /**
   * Repeat the password to ensure no typos
   * @example test-PASSWORD123
   */
  repeatPassword: string;
}`);
  });

  test('valid null', () => {
    const schema = Joi.object({
      value: Joi.valid(null)
    }).meta({ className: 'TestSchema' });

    const result = convertSchema({}, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`export interface TestSchema {
  value?: null;
}`);
    const validationResult = schema.validate({ value: {} });
    expect(validationResult.error).toBeTruthy();
  });
});

describe('Allow/Valid Enums', () => {
  beforeAll(async () => {
    if (existsSync(typeOutputDirectory)) {
      rmdirSync(typeOutputDirectory, { recursive: true });
    }

    await convertFromDirectory({
      schemaDirectory: './src/__tests__/allowValid/schemas',
      typeOutputDirectory
    });
  });

  test('Allow', async () => {
    const oneContent = readFileSync(`${typeOutputDirectory}/Allow.ts`).toString();

    expect(oneContent).toBe(
      `/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export type AllowRole = 'Admin' | 'User';

export interface AllowUser {
  firstName: string;
  lastName: string;
  role: AllowRole | 'Admin' | 'User';
}
`
    );
  });

  test('AllowOnly', async () => {
    const oneContent = readFileSync(`${typeOutputDirectory}/AllowOnly.ts`).toString();

    expect(oneContent).toBe(
      `/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export type AllowOnlyRole = 'Admin' | 'User';

export interface AllowOnlyUser {
  firstName: string;
  lastName: string;
  role: AllowOnlyRole;
}
`
    );
  });

  test('Valid', async () => {
    const oneContent = readFileSync(`${typeOutputDirectory}/Valid.ts`).toString();

    expect(oneContent).toBe(
      `/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export type ValidRole = 'Admin' | 'User';

export interface ValidUser {
  firstName: string;
  lastName: string;
  role: ValidRole;
}
`
    );
  });
});

describe('enums tests', () => {
  test('enums using valid()', () => {
    const schema = Joi.object({
      topColour: Joi.string().valid('red', 'green', 'orange', 'blue').required(),
      bottomColour: Joi.string().valid('red', 'green', 'orange', 'blue').required(),
      escape: Joi.string().valid("a'b", 'c"d', "e'f'g", 'h"i"j', '\\\\').required()
    })
      .meta({ className: 'TestSchema' })
      .description('a test schema definition');

    const result = convertSchema({ sortPropertiesByName: false }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface TestSchema {
  topColour: 'red' | 'green' | 'orange' | 'blue';
  bottomColour: 'red' | 'green' | 'orange' | 'blue';
  escape: 'a\\'b' | 'c"d' | 'e\\'f\\'g' | 'h"i"j' | '\\\\\\\\';
}`);
  });

  test('enums using allow()', () => {
    const schema = Joi.object({
      bit: Joi.boolean().allow(0, 1, '0', '1', null)
    })
      .meta({ className: 'TestSchema' })
      .description('a test schema definition');

    const result = convertSchema({ defaultToRequired: true }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface TestSchema {
  bit: 0 | 1 | '0' | '1' | null;
}`);
  });
});
