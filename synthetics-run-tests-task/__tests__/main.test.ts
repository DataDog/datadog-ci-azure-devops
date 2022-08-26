import {synthetics} from '@datadog/datadog-ci'
import {MockTestRunner} from 'azure-pipelines-task-lib/mock-test'
import {join} from 'path'
import {config, inputs} from './fixtures'
import {expectSpy} from './spy'

const runMockedTask = (mockTaskFile: string): MockTestRunner => {
  const task = new MockTestRunner(join(__dirname, 'mocks', mockTaskFile))
  task.run()

  // Warnings usually come from `mockery`, and can be useful to spot mocking issues.
  // For example, "Replacing existing mock for module: azure-pipelines-task-lib/task" means
  // that we tried to mock `azure-pipelines-task-lib/task`, which is already mocked
  // by `azure-pipelines-task-lib/mock-run`. So our mock would be overwritten.
  //
  // This assertion needs `setupWarnSpy()` in the mocked task.
  expect(task.stdout).not.toMatch(/^##vso\[task\.warn\]/m)

  return task
}

describe('Test suite', () => {
  test('succeeds when app and api keys are given', () => {
    const task = runMockedTask('succeed-with-api-keys.js')

    expectSpy(task, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...config,
      ...inputs,
      publicIds: ['public_id1', 'public_id2', 'public_id3'],
    })

    expect(task.succeeded).toBe(true)
    expect(task.warningIssues.length).toEqual(0)
    expect(task.errorIssues.length).toEqual(0)
  })

  test('fails when service connection has empty app or api keys', () => {
    const task = runMockedTask('fail-misconfigured-service-connection.js')

    expect(task.succeeded).toBe(false)
    expect(task.warningIssues.length).toEqual(0)
    expect(task.errorIssues.length).toEqual(2)
    expect(task.errorIssues[0]).toEqual(
      'Missing API or APP keys to initialize datadog-ci! Check your Datadog service connection.'
    )

    // We want this to appear, and the task to fail when an uncaught error is detected.
    expect(task.errorIssues[1]).toEqual('An uncaught error occurred.')
    expect(task.stderr).toMatch('[UNCAUGHT_ERROR] Error: Endpoint auth data not present: my service connection')
  })

  test('succeeds when service connection has app and api keys', () => {
    const task = runMockedTask('succeed-with-service-connection.js')

    expectSpy(task, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...config,
      ...inputs,
      publicIds: ['public_id1', 'public_id2', 'public_id3'],
      datadogSite: 'datadoghq.eu',
      subdomain: 'myorg',
    })

    expect(task.succeeded).toBe(true)
    expect(task.warningIssues.length).toEqual(0)
    expect(task.errorIssues.length).toEqual(0)
  })

  test('succeeds with a service connection set up with env vars', () => {
    const task = runMockedTask('succeed-with-service-connection-env-vars.js')

    expectSpy(task, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...config,
      ...inputs,
      publicIds: ['public_id1', 'public_id2', 'public_id3'],
      datadogSite: 'datadoghq.eu',
      subdomain: 'myorg',
    })

    expect(task.succeeded).toBe(true)
    expect(task.warningIssues.length).toEqual(0)
    expect(task.errorIssues.length).toEqual(0)
  })
})
