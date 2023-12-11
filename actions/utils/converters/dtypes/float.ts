import { type BaseConverter, convert, convertToString } from ".."

type Converter = BaseConverter<unknown, number>
type Convert = Converter["convert"]

class FloatConverter implements Converter {
  readonly inputType: string = "any"
  readonly targetType: string = "float"
  convert(value: unknown): number {
    const string_ = convertToString(value)
    const output = Number.parseFloat(string_)
    if (Number.isFinite(output)) return output

    throw new Error(`${string_} is not a float number`)
  }
}

export const toFloat: Converter = new FloatConverter()
export const convertToFloat: Convert = (input) => convert(input, toFloat)
