import {synthetics} from '@datadog/datadog-ci'

import * as fs from 'fs'

import {BASE_INPUTS, CUSTOM_PUBLIC_IDS, CUSTOM_SITE, CUSTOM_SUBDOMAIN, expectSpy, runScenario} from './fixtures'

const BASE_CONFIG = synthetics.DEFAULT_COMMAND_CONFIG

describe('Test suite', () => {
  test('succeeds when app and api keys are given', async () => {
    const result = await runScenario('api-keys')

    expectSpy(result, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      publicIds: CUSTOM_PUBLIC_IDS,
    })

    expect(result.succeeded).toBe(true)
    expect(result.warningIssues.length).toEqual(0)
    expect(result.errorIssues.length).toEqual(0)
  })

  test('fails when service connection has empty app or api keys', async () => {
    const result = await runScenario('service-connection-misconfigured')

    expect(result.succeeded).toBe(false)
    expect(result.warningIssues.length).toEqual(0)
    expect(result.errorIssues.length).toEqual(2)
    expect(result.errorIssues[0]).toEqual(
      'Missing API or APP keys to initialize datadog-ci! Check your Datadog service connection.'
    )

    // We want this to appear, and the task to fail when an uncaught error is detected.
    expect(result.errorIssues[1]).toEqual('An uncaught error occurred.')
    expect(result.stderr).toMatch('[UNCAUGHT_ERROR] Error: Endpoint auth data not present: my service connection')
  })

  test('succeeds when service connection has app and api keys', async () => {
    const result = await runScenario('service-connection')

    expectSpy(result, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
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

    expect(result.succeeded).toBe(true)
    expect(result.warningIssues.length).toEqual(0)
    expect(result.errorIssues.length).toEqual(0)
  })

  test('succeeds with a service connection set up with env vars', async () => {
    const result = await runScenario('service-connection-env-vars')

    expectSpy(result, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      datadogSite: CUSTOM_SITE,
      publicIds: CUSTOM_PUBLIC_IDS,
      subdomain: CUSTOM_SUBDOMAIN,
    })

    expect(result.succeeded).toBe(true)
    expect(result.warningIssues.length).toEqual(0)
    expect(result.errorIssues.length).toEqual(0)
  })

  test('succeeds and generates a jUnit report', async () => {
    const result = await runScenario('junit-report')

    expectSpy(result, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      publicIds: CUSTOM_PUBLIC_IDS,
    })

    expect(result.succeeded).toBe(true)
    expect(result.warningIssues.length).toEqual(0)
    expect(result.errorIssues.length).toEqual(0)

    expect(fs.existsSync('./reports/TEST-1.xml')).toBe(true)

    // Cleaning
    fs.unlinkSync('./reports/TEST-1.xml')
    fs.rmdirSync('./reports')
  })

  test('pollingTimeout input overrides the default config', async () => {
    const result = await runScenario('polling-timeout')

    expectSpy(result, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      batchTimeout: 3600000,
      publicIds: CUSTOM_PUBLIC_IDS,
    })

    expect(result.succeeded).toBe(true)
    expect(result.warningIssues.length).toEqual(0)
    expect(result.errorIssues.length).toEqual(0)
  })
})
