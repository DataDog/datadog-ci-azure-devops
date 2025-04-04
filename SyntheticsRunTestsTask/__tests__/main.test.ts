import {synthetics} from '@datadog/datadog-ci'

import * as fs from 'fs'

import {
  BASE_INPUTS,
  CUSTOM_PUBLIC_IDS,
  CUSTOM_SITE,
  CUSTOM_SUBDOMAIN,
  expectSpy,
  runMockTaskApiKeys,
  runMockTaskJUnitReport,
  runMockTaskPollingTimeout,
  runMockTaskServiceConnection,
  runMockTaskServiceConnectionEnvVars,
  runMockTaskServiceConnectionMisconfigured,
} from './fixtures'

const BASE_CONFIG = synthetics.DEFAULT_COMMAND_CONFIG

describe('Test suite', () => {
  test('succeeds when app and api keys are given', async () => {
    const task = await runMockTaskApiKeys()

    expectSpy(task, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      publicIds: CUSTOM_PUBLIC_IDS,
    })

    expect(task.succeeded).toBe(true)
    expect(task.warningIssues.length).toEqual(0)
    expect(task.errorIssues.length).toEqual(0)
  })

  test('fails when service connection has empty app or api keys', async () => {
    const task = await runMockTaskServiceConnectionMisconfigured()

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

  test('succeeds when service connection has app and api keys', async () => {
    const task = await runMockTaskServiceConnection()

    expectSpy(task, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      publicIds: CUSTOM_PUBLIC_IDS,
      datadogSite: CUSTOM_SITE,
      subdomain: CUSTOM_SUBDOMAIN,
      defaultTestOverrides: {
        ...BASE_CONFIG.defaultTestOverrides,
        variables: {
          FOO: 'bar',
        },
      },
    })

    expect(task.succeeded).toBe(true)
    expect(task.warningIssues.length).toEqual(0)
    expect(task.errorIssues.length).toEqual(0)
  })

  test('succeeds with a service connection set up with env vars', async () => {
    const task = await runMockTaskServiceConnectionEnvVars()

    expectSpy(task, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      datadogSite: CUSTOM_SITE,
      publicIds: CUSTOM_PUBLIC_IDS,
      subdomain: CUSTOM_SUBDOMAIN,
    })

    expect(task.succeeded).toBe(true)
    expect(task.warningIssues.length).toEqual(0)
    expect(task.errorIssues.length).toEqual(0)
  })

  test('succeeds and generates a jUnit report', async () => {
    const task = await runMockTaskJUnitReport()

    expectSpy(task, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      publicIds: CUSTOM_PUBLIC_IDS,
    })

    expect(task.succeeded).toBe(true)
    expect(task.warningIssues.length).toEqual(0)
    expect(task.errorIssues.length).toEqual(0)

    expect(fs.existsSync('./reports/TEST-1.xml')).toBe(true)

    // Cleaning
    fs.unlinkSync('./reports/TEST-1.xml')
    fs.rmdirSync('./reports')
  })

  test('pollingTimeout input overrides the default config', async () => {
    const task = await runMockTaskPollingTimeout()

    expectSpy(task, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      batchTimeout: 3600000,
      publicIds: CUSTOM_PUBLIC_IDS,
    })

    expect(task.succeeded).toBe(true)
    expect(task.warningIssues.length).toEqual(0)
    expect(task.errorIssues.length).toEqual(0)
  })
})
