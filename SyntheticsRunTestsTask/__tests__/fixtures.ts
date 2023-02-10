import {join} from 'path'

import {synthetics} from '@datadog/datadog-ci'
import {MockTestRunner} from 'azure-pipelines-task-lib/mock-test'

import * as fs from 'fs'

export const BASE_CONFIG: synthetics.CommandConfig = {
  apiKey: '',
  appKey: '',
  configPath: 'datadog-ci.json',
  datadogSite: 'datadoghq.com',
  failOnCriticalErrors: false,
  failOnMissingTests: false,
  failOnTimeout: false,
  files: ['{,!(node_modules)/**/}*.synthetics.json'],
  global: {},
  locations: [],
  pollingTimeout: 2 * 60 * 1000,
  proxy: {protocol: 'http'},
  publicIds: [],
  subdomain: 'app',
  tunnel: false,
  variableStrings: [],
}

export const BASE_INPUTS = {
  apiKey: 'xxx',
  appKey: 'yyy',
  publicIds: ['public_id1'],
}

export const EMPTY_SUMMARY: synthetics.Summary = {
  criticalErrors: 0,
  passed: 0,
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

const runMockedTask = (mockName: string): MockTestRunner => {
  const file = join(__dirname, 'mocks', `${mockName}.js`)

  if (!fs.existsSync(file)) {
    throw Error(`The mocked task file does not exist: mocks/${mockName}.js\n` + 'Did you forget to run `yarn build`?')
  }

  const task = new MockTestRunner(file)
  task.run()
  // Warnings usually come from `mockery`, and can be useful to spot mocking issues.
  // For example, "Replacing existing mock for module: azure-pipelines-task-lib/task" means
  // that we tried to mock `azure-pipelines-task-lib/task`, which is already mocked
  // by `azure-pipelines-task-lib/mock-run`. So our mock would be overwritten.
  //
  // This assertion needs `setupWarnSpy()` in the mocked task.
  expect(task.stdout).not.toMatch(/^##vso\[task\.warn\]/m)

  if (
    task.stderr.match(/Cannot find module/) &&
    process.env.NODE_OPTIONS?.match(/ms-vscode.js-debug\/bootloader\.js/)
  ) {
    throw Error('Did you enable the Auto Attach feature in VS Code?\n\n' + task.stderr)
  }

  return task
}

export const runMockTaskApiKeys = (): MockTestRunner => {
  return runMockedTask('api-keys')
}
export const runMockTaskServiceConnection = (): MockTestRunner => {
  return runMockedTask('service-connection')
}
export const runMockTaskServiceConnectionEnvVars = (): MockTestRunner => {
  return runMockedTask('service-connection-env-vars')
}
export const runMockTaskServiceConnectionMisconfigured = (): MockTestRunner => {
  return runMockedTask('service-connection-misconfigured')
}

// The MockTestRunner runs the task it's given in a separate process, so Jest spies cannot work.
// As a workaround, we need to log from the task process with `spyLog()` in a mocked function,
// and extract the spy logs from the task's `stdout`, in the runner process.
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

    expect(logs).toContainEqual(args)
  },
})

export const setupWarnSpy = (): void => {
  // If we don't do this, warnings are not prefixed with `##vso[task` and excluded from the `task.stdout`.
  console.warn = (...data) => {
    console.log(`##vso[task.warn]${data[0]}`)
  }
}
