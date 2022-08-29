import {join} from 'path'

import {synthetics} from '@datadog/datadog-ci'
import {TaskMockRunner} from 'azure-pipelines-task-lib/mock-run'

import {BASE_INPUTS, EMPTY_SUMMARY, setupWarnSpy, spyLog} from '../fixtures'

setupWarnSpy()

const mockRunner = new TaskMockRunner(join(__dirname, '../..', 'task.js'))

const publicIds = ['public_id1', 'public_id2', 'public_id3']

mockRunner.setInput('authenticationType', 'apiAppKeys')
mockRunner.setInput('apiKey', BASE_INPUTS.apiKey)
mockRunner.setInput('appKey', BASE_INPUTS.appKey)
mockRunner.setInput('publicIds', publicIds.join(', '))

mockRunner.registerMock('@datadog/datadog-ci', {
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
