import {getDefinedBoolean, getDefinedInteger} from '../utils'

describe('getDefinedInteger', () => {
  test('returns undefined if input is not set', async () => {
    expect(getDefinedInteger(undefined, {inputName: ''})).toBeUndefined()
  })

  test('returns undefined if input is an empty value', async () => {
    expect(getDefinedInteger('', {inputName: ''})).toBeUndefined()
  })

  test('throws if input is a float', async () => {
    expect(() => getDefinedInteger('1.2', {inputName: ''})).toThrow('1.2 is not an integer')
  })

  test('returns the value if input is an integer', async () => {
    expect(getDefinedInteger('1', {inputName: ''})).toStrictEqual(1)
  })
})

describe('getDefinedBoolean', () => {
  test('returns undefined if input is not set', async () => {
    expect(getDefinedBoolean(undefined, {inputName: ''})).toBeUndefined()
  })

  test('returns undefined if input is an empty value', async () => {
    expect(getDefinedBoolean('', {inputName: ''})).toBeUndefined()
  })

  test('throws if input is not a boolean', async () => {
    expect(() => getDefinedBoolean('not_a_bool', {inputName: ''})).toThrow('not_a_bool is not a valid YAML boolean')
  })

  test('returns the value if input is a string', async () => {
    expect(getDefinedBoolean('true', {inputName: ''})).toBe(true)
    expect(getDefinedBoolean('false', {inputName: ''})).toBe(false)
    expect(getDefinedBoolean('TrUe', {inputName: ''})).toBe(true)
    expect(getDefinedBoolean('FaLsE', {inputName: ''})).toBe(false)
  })
})
