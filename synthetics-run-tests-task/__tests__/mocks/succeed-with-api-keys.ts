import {synthetics} from '@datadog/datadog-ci'
import {TaskMockRunner} from 'azure-pipelines-task-lib/mock-run'
import {emptySummary, inputs} from '../fixtures'
import {spyLog} from '../spy'
import {join} from 'path'

const mockRunner = new TaskMockRunner(join(__dirname, '../..', 'task.js'))

const publicIds = ['public_id1', 'public_id2', 'public_id3']

mockRunner.setInput('authenticationType', 'apiAppKeys')
mockRunner.setInput('apiKey', inputs.apiKey)
mockRunner.setInput('appKey', inputs.appKey)
mockRunner.setInput('publicIds', publicIds.join(', '))

const syntheticsMock = Object.assign({}, synthetics)
mockRunner.registerMock('@datadog/datadog-ci', {
  synthetics: {
    ...syntheticsMock,
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
