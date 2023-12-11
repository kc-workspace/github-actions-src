import { type BaseConverter, convert, convertToString } from ".."

type Converter = BaseConverter<unknown, boolean>
type Convert = Converter["convert"]

const possibleTrue = new Set(["true", "t", "1", "on"])
const possibleFalse = new Set(["false", "f", "0", "off"])

class BooleanConverter implements Converter {
  readonly inputType: string = "any"
  readonly targetType: string = "boolean"
  convert(value: unknown): boolean {
    const valueString = convertToString(value).toLowerCase()
    if (possibleTrue.has(valueString)) return true
    if (possibleFalse.has(valueString)) return false
    throw new Error(`${valueString} is not a boolean`)
  }
}

export const toBool: Converter = new BooleanConverter()
export const convertToBool: Convert = (input) => convert(input, toBool)
