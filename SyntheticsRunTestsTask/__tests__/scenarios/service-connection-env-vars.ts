import {join} from 'path'

import {synthetics, utils} from '@datadog/datadog-ci'
import {TaskMockRunner} from 'azure-pipelines-task-lib/mock-run'

import {
  BASE_INPUTS,
  CUSTOM_PUBLIC_IDS,
  CUSTOM_SITE,
  CUSTOM_SUBDOMAIN,
  EMPTY_SUMMARY,
  setupWarnSpy,
  spyLog,
} from '../fixtures'

setupWarnSpy()

const mockRunner = new TaskMockRunner(join(__dirname, '../..', 'task.js'))

const CONNECTED_SERVICE_NAME = 'foo'

process.env['INPUT_AUTHENTICATIONTYPE'] = 'connectedService'
process.env['INPUT_CONNECTEDSERVICE'] = CONNECTED_SERVICE_NAME
process.env['INPUT_PUBLICIDS'] = CUSTOM_PUBLIC_IDS.join(', ')

process.env[`ENDPOINT_URL_${CONNECTED_SERVICE_NAME}`] = `https://app.${CUSTOM_SITE}/`
process.env[`ENDPOINT_AUTH_PARAMETER_${CONNECTED_SERVICE_NAME.toLocaleUpperCase()}_APITOKEN`] = BASE_INPUTS.apiKey
process.env[`ENDPOINT_AUTH_PARAMETER_${CONNECTED_SERVICE_NAME.toLocaleUpperCase()}_APPKEY`] = BASE_INPUTS.appKey
process.env[`ENDPOINT_DATA_${CONNECTED_SERVICE_NAME}_SUBDOMAIN`] = CUSTOM_SUBDOMAIN

mockRunner.registerMock('@datadog/datadog-ci', {
  utils,
  synthetics: {
    ...synthetics,
    executeTests: async (
      ...args: Parameters<typeof synthetics.executeTests>
    ): ReturnType<typeof synthetics.executeTests> => {
      spyLog(synthetics.executeTests, args)
      return {
        results: [],
        summary: EMPTY_SUMMARY,
      }
    },
  },
})

mockRunner.run()
