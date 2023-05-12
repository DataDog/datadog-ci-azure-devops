import * as task from 'azure-pipelines-task-lib/task'

export const parseMultiline = (value: string | undefined): string[] | undefined => {
  return value?.split(/,|\n/).map((variableString: string) => variableString.trim())
}

export const getDefinedInteger = (value: string | undefined): number | undefined => {
  if (!value) {
    return undefined
  }

  const number = parseFloat(value)
  if (!Number.isInteger(number)) {
    const error = Error(`${number} is not an integer`)
    task.setResult(task.TaskResult.Failed, error.message)
    throw error
  }

  return number
}
