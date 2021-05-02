import { existsSync, readFileSync, rmdirSync } from 'fs';

import { convertFromDirectory } from '../../index';

describe('Primitive Types', () => {
  const typeOutputDirectory = './src/__tests__/primitiveTypes/interfaces';
  beforeAll(async () => {
    if (existsSync(typeOutputDirectory)) {
      rmdirSync(typeOutputDirectory, { recursive: true });
    }
    const result = await convertFromDirectory({
      schemaDirectory: './src/__tests__/primitiveTypes/schemas',
      typeOutputDirectory
    });

    expect(result).toBe(true);
  });

  test('String base schema', async () => {
    const readmeContent = readFileSync(`${typeOutputDirectory}/Email.ts`).toString();

    expect(readmeContent).toBe(`/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface CompanySchema {
  email?: Email;
}

export type Email = string;

export interface UserSchema {
  email: Email;
}
`);
  });

  test('number base schema', async () => {
    const readmeContent = readFileSync(`${typeOutputDirectory}/Counter.ts`).toString();

    expect(readmeContent).toBe(`/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface CompanySchema {
  counter?: Counter;
}

export type Counter = number;

export interface UserSchema {
  counter: Counter;
}
`);
  });

  test('Date base schema', async () => {
    const readmeContent = readFileSync(`${typeOutputDirectory}/DateField.ts`).toString();

    expect(readmeContent).toBe(`/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface CompanySchema {
  counter?: DateField;
}

export type DateField = Date;

export interface UserSchema {
  counter: DateField;
}
`);
  });

  test('boolean base schema', async () => {
    const readmeContent = readFileSync(`${typeOutputDirectory}/Boolean.ts`).toString();

    expect(readmeContent).toBe(`/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export type Boolean = boolean;

export interface CompanySchema {
  counter?: Boolean;
}

export interface UserSchema {
  counter: Boolean;
}
`);
  });

  test('allow on base schema', async () => {
    const readmeContent = readFileSync(`${typeOutputDirectory}/Allow.ts`).toString();

    expect(readmeContent).toBe(`/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export type Blank = string;

export type BlankNull = string | null | '';

/**
 * This is date
 */
export type DateOptions = Date | null;

/**
 * Test Schema Name
 */
export type Name = string;

export type NormalList = 'red' | 'green' | 'blue';

export type NormalRequiredList = 'red' | 'green' | 'blue';

/**
 * nullable
 */
export type NullName = string | null;

export type NullNumber = number | null;

export type Numbers = 1 | 2 | 3 | 4 | 5;
`);
  });

  test('ensure primitive types are exported/imported correctly', async () => {
    const readmeContent = readFileSync(`${typeOutputDirectory}/Using.ts`).toString();

    expect(readmeContent).toBe(`/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface UsingOtherTypesSchema {
  property?: string | null | '';
}
`);
  });
});
