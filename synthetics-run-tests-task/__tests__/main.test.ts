import {synthetics} from '@datadog/datadog-ci'
import {MockTestRunner} from 'azure-pipelines-task-lib/mock-test'
import {join} from 'path'
import {config, inputs} from './fixtures'
import {expectSpy} from './spy'

describe('Test suite', () => {
  test('succeeds when app and api keys are given', () => {
    const task = new MockTestRunner(join(__dirname, 'mocks', 'succeed-with-api-keys.js'))
    task.run()

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
    const task = new MockTestRunner(join(__dirname, 'mocks', 'fail-misconfigured-service-connection.js'))
    task.run()

    expect(task.succeeded).toBe(false)
    expect(task.warningIssues.length).toEqual(0)
    expect(task.errorIssues.length).toEqual(2)
    expect(task.errorIssues[0]).toEqual(
      'Missing API or APP keys to initialize datadog-ci! Check your Datadog service connection.'
    )
    expect(task.errorIssues[1]).toEqual('An uncaught error occurred.')
    expect(task.stderr).toMatch('[UNCAUGHT_ERROR] Error: Endpoint auth data not present: my service connection')
  })

  test('succeeds when service connection has app and api keys', () => {
    const task = new MockTestRunner(join(__dirname, 'mocks', 'succeed-with-service-connection.js'))
    task.run()

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
