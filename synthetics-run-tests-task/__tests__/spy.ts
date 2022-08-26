import {MockTestRunner} from 'azure-pipelines-task-lib/mock-test'

// The MockTestRunner runs the task it's given in a separate process, so Jest spies cannot work.
// As a workaround, we need to log from the task process with `spyLog()` in a mocked function,
// and extract the spy logs from the task's `stdout`, in the runner process.

export const spyLog = (fn: Function, value: unknown, spyId: string | number = 1): void => {
  console.log(`##vso[task.spy][${fn.name}.${spyId}]` + JSON.stringify(value))
}

export const expectSpy = <Fn extends (...args: unknown[]) => unknown>(
  task: MockTestRunner,
  fn: Fn,
  spyId: string | number = 1
): {
  toHaveBeenCalledWith: (...args: Parameters<Fn>) => void
} => ({
  toHaveBeenCalledWith(...args: Parameters<Fn>) {
    const prefixMatcher = RegExp(`^##vso\\[task\\.spy\\]\\[${fn.name}\\.${spyId}\\]`)
    const matcher = RegExp(`${prefixMatcher.source}(.*)`, 'gm')

    const spyLogs = task.stdout.match(matcher) || []
    const logs: unknown[] = spyLogs.map(log => JSON.parse(log.replace(prefixMatcher, '')))

    expect(logs).toContainEqual(args)
  },
})

export const setupWarnSpy = (): void => {
  // If we don't do this, warnings are not prefixed with `##vso[task` and excluded from the `task.stdout`.
  console.warn = (...data) => {
    console.log(`##vso[task.warn]${data[0]}`)
  }
}
