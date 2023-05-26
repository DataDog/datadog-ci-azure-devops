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
// We need to fallback to our defaults.
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
