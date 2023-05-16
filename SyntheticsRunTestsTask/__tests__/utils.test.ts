import {getDefinedInteger} from '../utils'

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
