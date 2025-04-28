import {join} from 'path'

import {synthetics, utils} from '@datadog/datadog-ci'
import {TaskMockRunner} from 'azure-pipelines-task-lib/mock-run'

import {BASE_INPUTS, CUSTOM_PUBLIC_IDS, EMPTY_SUMMARY, setupWarnSpy, spyLog} from '../fixtures'

setupWarnSpy()

const mockRunner = new TaskMockRunner(join(__dirname, '../..', 'task.js'))

mockRunner.setInput('authenticationType', 'apiAppKeys')
mockRunner.setInput('apiKey', BASE_INPUTS.apiKey)
mockRunner.setInput('appKey', BASE_INPUTS.appKey)
mockRunner.setInput('batchTimeout', `${60 * 60 * 1000}`)
mockRunner.setInput('publicIds', CUSTOM_PUBLIC_IDS.join(', '))

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
