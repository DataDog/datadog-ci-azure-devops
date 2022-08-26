import {synthetics} from '@datadog/datadog-ci'
import {TaskMockRunner} from 'azure-pipelines-task-lib/mock-run'
import {emptySummary, inputs} from '../fixtures'
import {setupWarnSpy, spyLog} from '../spy'
import {join} from 'path'

setupWarnSpy()

const mockRunner = new TaskMockRunner(join(__dirname, '../..', 'task.js'))

const publicIds = ['public_id1', 'public_id2', 'public_id3']

process.env['INPUT_AUTHENTICATIONTYPE'] = 'connectedService'
process.env['INPUT_CONNECTEDSERVICE'] = 'foo'
process.env['INPUT_PUBLICIDS'] = publicIds.join(', ')

process.env['ENDPOINT_URL_foo'] = 'https://app.datadoghq.eu'
process.env['ENDPOINT_AUTH_PARAMETER_FOO_APITOKEN'] = inputs.apiKey
process.env['ENDPOINT_AUTH_PARAMETER_FOO_APPKEY'] = inputs.appKey
process.env['ENDPOINT_DATA_foo_SUBDOMAIN'] = 'myorg'

mockRunner.registerMock('@datadog/datadog-ci', {
  synthetics: {
    ...synthetics,
    executeTests: async (
      ...args: Parameters<typeof synthetics.executeTests>
    ): ReturnType<typeof synthetics.executeTests> => {
      spyLog(synthetics.executeTests, args)
      return {
        results: [],
        summary: emptySummary,
      }
    },
  },
})

mockRunner.run()
