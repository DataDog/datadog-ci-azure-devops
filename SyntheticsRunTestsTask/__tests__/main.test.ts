import {synthetics} from '@datadog/datadog-ci'

import {
  BASE_CONFIG,
  BASE_INPUTS,
  CUSTOM_PUBLIC_IDS,
  CUSTOM_SITE,
  CUSTOM_SUBDOMAIN,
  CUSTOM_VARIABLES,
  expectSpy,
  runMockTaskApiKeys,
  runMockTaskApiKeysWithVariables,
  runMockTaskServiceConnection,
  runMockTaskServiceConnectionEnvVars,
  runMockTaskServiceConnectionMisconfigured,
} from './fixtures'

describe('Test suite', () => {
  test('succeeds when app and api keys are given', () => {
    const task = runMockTaskApiKeys()

    expectSpy(task, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      publicIds: CUSTOM_PUBLIC_IDS,
    })

    expect(task.succeeded).toBe(true)
    expect(task.warningIssues.length).toEqual(0)
    expect(task.errorIssues.length).toEqual(0)
  })

  test('fails when service connection has empty app or api keys', () => {
    const task = runMockTaskServiceConnectionMisconfigured()

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
    const task = runMockTaskServiceConnection()

    expectSpy(task, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      publicIds: CUSTOM_PUBLIC_IDS,
      datadogSite: CUSTOM_SITE,
      subdomain: CUSTOM_SUBDOMAIN,
      global: {
        variables: {
          FOO: 'bar',
        },
      },
    })

    expect(task.succeeded).toBe(true)
    expect(task.warningIssues.length).toEqual(0)
    expect(task.errorIssues.length).toEqual(0)
  })

  test('succeeds with a service connection set up with env vars', () => {
    const task = runMockTaskServiceConnectionEnvVars()

    expectSpy(task, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      publicIds: CUSTOM_PUBLIC_IDS,
      datadogSite: CUSTOM_SITE,
      subdomain: CUSTOM_SUBDOMAIN,
    })

    expect(task.succeeded).toBe(true)
    expect(task.warningIssues.length).toEqual(0)
    expect(task.errorIssues.length).toEqual(0)
  })

  test('parse variables input', () => {
    const task = runMockTaskApiKeysWithVariables()

    expectSpy(task, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      publicIds: CUSTOM_PUBLIC_IDS,
      global: {
        variables: CUSTOM_VARIABLES,
      },
    })

    expect(task.succeeded).toBe(true)
    expect(task.warningIssues.length).toEqual(0)
    expect(task.errorIssues.length).toEqual(0)
  })
})
