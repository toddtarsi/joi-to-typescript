import { existsSync, readFileSync, rmdirSync } from 'fs';
import Joi from 'joi';

import { convertFromDirectory, convertSchema } from '../../index';

describe('Tuple types', () => {
  const typeOutputDirectory = './src/__tests__/tuple/interfaces';

  beforeAll(() => {
    if (existsSync(typeOutputDirectory)) {
      rmdirSync(typeOutputDirectory, { recursive: true });
    }
  });

  test('tuple variations from file', async () => {
    const result = await convertFromDirectory({
      schemaDirectory: './src/__tests__/tuple/schemas',
      typeOutputDirectory
    });

    expect(result).toBe(true);

    const oneContent = readFileSync(`${typeOutputDirectory}/One.ts`).toString();

    expect(oneContent).toBe(
      `/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface Item {
  name: string;
}

/**
 * a test schema definition
 */
export interface Test {
  items?: [number, string, Item?] | null;
  name?: string;
  propertyName1: boolean;
}

/**
 * A tuple of Test object
 */
export type TestTuple = [Test, (number | string)?];
`
    );
  });

  test("test to ensure can't use ordered and items both", () => {
    const schema = Joi.array()
      .ordered(Joi.string().description('one'))
      .items(Joi.number().description('two'))
      .required()
      .meta({ className: 'TestList' })
      .description('A list of Test object');



    const result = convertSchema({ sortPropertiesByName: true }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * A list of Test object
 */
export type TestList = any[];`);
  });
});
