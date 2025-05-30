import {synthetics} from '@datadog/datadog-ci'

import * as fs from 'fs'

import {BASE_INPUTS, CUSTOM_PUBLIC_IDS, CUSTOM_SITE, CUSTOM_SUBDOMAIN, expectSpy, runScenario} from './fixtures'

const BASE_CONFIG = synthetics.DEFAULT_COMMAND_CONFIG

describe('Test suite', () => {
  test('succeeds when api and app keys are given', async () => {
    const result = await runScenario('api-keys')

    expectSpy(result, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      publicIds: CUSTOM_PUBLIC_IDS,
    })

    expect(result.succeeded).toBe(true)
    expect(result.warningIssues.length).toEqual(0)
    expect(result.errorIssues.length).toEqual(0)

    const output = result.stdout.split('\n').filter(line => line.includes('##vso[task.setvariable'))

    const setVariableStr = (name: string, value: string): string =>
      `##vso[task.setvariable variable=${name};isOutput=true;issecret=false;]${value}`

    expect(output.length).toEqual(10)
    expect(output[0]).toContain(
      setVariableStr('batchUrl', 'https://app.datadoghq.com/synthetics/explorer/ci?batchResultId=batch-id')
    )
    expect(output[1]).toContain(setVariableStr('criticalErrorsCount', '1'))
    expect(output[2]).toContain(setVariableStr('failedNonBlockingCount', '3'))
    expect(output[3]).toContain(setVariableStr('failedCount', '2'))
    expect(output[4]).toContain(setVariableStr('passedCount', '4'))
    expect(output[5]).toContain(setVariableStr('previouslyPassedCount', '5'))
    expect(output[6]).toContain(setVariableStr('testsNotFoundCount', '1'))
    expect(output[7]).toContain(setVariableStr('testsSkippedCount', '6'))
    expect(output[8]).toContain(setVariableStr('timedOutCount', '7'))
    expect(output[9]).toContain(
      setVariableStr('rawResults', JSON.stringify([{passed: true, result: {start_url: 'https://example.org'}}]))
    )
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

  test('batchTimeout input overrides the default config', async () => {
    const result = await runScenario('batch-timeout')

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

  test('selectiveRerun input overrides the default config', async () => {
    const result = await runScenario('selective-rerun')

    expectSpy(result, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      publicIds: CUSTOM_PUBLIC_IDS,
      selectiveRerun: true,
    })

    expect(result.succeeded).toBe(true)
    expect(result.warningIssues.length).toEqual(0)
    expect(result.errorIssues.length).toEqual(0)
  })

  test('locations input overrides the default config', async () => {
    const result = await runScenario('locations')

    expectSpy(result, synthetics.executeTests).toHaveBeenCalledWith(expect.anything(), {
      ...BASE_CONFIG,
      ...BASE_INPUTS,
      publicIds: CUSTOM_PUBLIC_IDS,
      defaultTestOverrides: {
        ...BASE_CONFIG.defaultTestOverrides,
        locations: ['aws:eu-central-1', 'aws:eu-west-1'],
      },
    })

    expect(result.succeeded).toBe(true)
    expect(result.warningIssues.length).toEqual(0)
    expect(result.errorIssues.length).toEqual(0)
  })
})
