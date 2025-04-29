import chalk from 'chalk'
import {relative, join} from 'path'

import {synthetics} from '@datadog/datadog-ci'
import {MockTestRunner} from 'azure-pipelines-task-lib/mock-test'

import * as fs from 'fs'

export const BASE_INPUTS = {
  apiKey: 'xxx',
  appKey: 'yyy',
  publicIds: ['public_id1'],
}

export const EMPTY_SUMMARY: synthetics.Summary = {
  criticalErrors: 0,
  expected: 0,
  passed: 0,
  previouslyPassed: 0,
  failed: 0,
  failedNonBlocking: 0,
  skipped: 0,
  testsNotFound: new Set(),
  timedOut: 0,
  batchId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
}

export const CUSTOM_SUBDOMAIN = 'myorg'
export const CUSTOM_SITE = 'datadoghq.eu'
export const CUSTOM_PUBLIC_IDS = ['public_id1', 'public_id2', 'public_id3']

export const runScenario = async (scenarioName: string): Promise<MockTestRunner> => {
  const file = join(__dirname, 'scenarios', `${scenarioName}.js`)

  if (!fs.existsSync(file)) {
    throw Error(`The scenario does not exist: scenarios/${scenarioName}.js\n` + 'Did you forget to run `yarn build`?')
  }

  // See `20.11.0` in `.node-version`
  const nodeVersion = 20

  const task = await new MockTestRunner().LoadAsync(file)
  await task.runAsync(nodeVersion)

  // Warnings can be useful to spot mocking issues.
  // For example, "Replacing existing mock for module: azure-pipelines-task-lib/task" means
  // that we tried to mock `azure-pipelines-task-lib/task`, which is already mocked
  // by `azure-pipelines-task-lib/mock-run`. So our mock would be overwritten.
  //
  // This assertion requires `setupWarnSpy()` to be run in the mocked task.
  expect(task.stdout).not.toMatch(/^##vso\[task\.warn\]/m)

  if (
    task.stderr.match(/Cannot find module/) &&
    process.env.NODE_OPTIONS?.match(/ms-vscode.js-debug\/bootloader\.js/)
  ) {
    throw Error('⚠️  You need to disable the Auto Attach feature in VS Code.\n\n' + task.stderr)
  }

  return task
}

// The MockTestRunner runs the scenario it's given in a separate process, so Jest spies cannot work.
// As a workaround, we need to log from the scenario process with `spyLog()` in a mocked function,
// and extract the spy logs from the scenario's `stdout`, in the runner process.
export const spyLog = (fn: Function, value: unknown, spyId: string | number = 1): void => {
  console.log(`##vso[task.spy][${fn.name}.${spyId}]` + JSON.stringify(value))
}

export const expectSpy = <Fn extends typeof synthetics.executeTests>(
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

    try {
      // NOTE:
      // 💡 You can run `node __tests__/scenarios/<scenario-name>.js` to debug issues with a scenario.
      expect(logs).toContainEqual(args)
    } catch (error) {
      const mockedTaskPath = relative(process.cwd(), task['_testPath'])
      const header = `The task ${chalk.red(mockedTaskPath)} finished with this \`stderr\`, which you may find helpful:`

      process.stdout.write(`\n${chalk.bold.white(header)}\n\n${chalk.red(task.stderr)}\n`)
      throw error
    }
  },
})

export const setupWarnSpy = (): void => {
  // If we don't do this, warnings are not prefixed with `##vso[task` and excluded from `task.stdout`.
  console.warn = (...data) => {
    console.log('##vso[task.warn]', ...data)
  }

  // We can't do this for errors because it changes the behavior too much: `task.errorIssues` gets broken
  // AND we actually expect errors in some tests.
}
