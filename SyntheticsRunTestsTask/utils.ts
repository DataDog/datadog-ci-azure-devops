import * as task from 'azure-pipelines-task-lib/task'

export const parseMultiline = (value: string | undefined): string[] | undefined => {
  return value?.split(/,|\n/).map((variableString: string) => variableString.trim())
}

export const getDefinedInteger = (value: string | undefined, {inputName}: {inputName: string}): number | undefined => {
  if (!value) {
    return undefined
  }

  const number = parseFloat(value)
  if (!Number.isInteger(number)) {
    const error = Error(`Invalid value for ${inputName}: ${number} is not an integer`)
    task.setResult(task.TaskResult.Failed, error.message)
    throw error
  }

  return number
}

// Cannot use task.getBoolInput() because "If required is false and the value is not set, returns false."
// This helper needs to return undefined if the input is not provided so that it's overwritten by the other parameter sources when building the config.
export const getDefinedBoolean = (value: string | undefined, {inputName}: {inputName: string}): boolean | undefined => {
  if (!value) {
    return undefined
  }

  if (value.toUpperCase() === 'TRUE') {
    return true
  }

  if (value.toUpperCase() === 'FALSE') {
    return false
  }

  const error = Error(`Invalid value for ${inputName}: ${value} is not a valid YAML boolean`)
  task.setResult(task.TaskResult.Failed, error.message)
  throw error
}

/**
 * Returns a variables map from a list of strings, each of the form `VARIABLE_NAME=value`.
 */
export const parseVariableStrings = (
  keyValueStrings: string[] = [],
  logFunction: (log: string) => void
): {[variableName: string]: string} | undefined => {
  const variables: {[key: string]: string} = {}

  for (const keyValueString of keyValueStrings) {
    const separatorIndex = keyValueString.indexOf('=')

    if (separatorIndex === -1) {
      logFunction(`Ignoring variable "${keyValueString}" as separator "=" was not found`)
      continue
    }

    if (separatorIndex === 0) {
      logFunction(`Ignoring variable "${keyValueString}" as variable name is empty`)
      continue
    }

    const key = keyValueString.substring(0, separatorIndex)
    const value = keyValueString.substring(separatorIndex + 1)

    variables[key] = value
  }

  return Object.keys(variables).length > 0 ? variables : undefined
}
