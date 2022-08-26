import {synthetics} from '@datadog/datadog-ci'
import {TaskMockRunner} from 'azure-pipelines-task-lib/mock-run'
import {emptySummary, inputs} from '../fixtures'
import {setupWarnSpy, spyLog} from '../spy'
import {join} from 'path'
import type task from 'azure-pipelines-task-lib/task'

setupWarnSpy()

const mockRunner = new TaskMockRunner(join(__dirname, '../..', 'task.js'))

const publicIds = ['public_id1', 'public_id2', 'public_id3']

mockRunner.setInput('authenticationType', 'connectedService')
mockRunner.setInput('connectedService', 'my service connection')
mockRunner.setInput('publicIds', publicIds.join(', '))

const taskMock: typeof task = Object.assign({}, require('azure-pipelines-task-lib/mock-task'))
taskMock.getEndpointUrlRequired = () => 'https://app.datadoghq.eu'
taskMock.getEndpointDataParameter = (_: string, key: string, __: boolean) => {
  if (key === 'subdomain') {
    return 'myorg'
  }
}
taskMock.getEndpointAuthorizationParameterRequired = (_: string, key: string) => {
  switch (key) {
    case 'apitoken':
      return inputs.apiKey
    case 'appkey':
      return inputs.appKey
    default:
      return ''
  }
}
mockRunner.registerMock('azure-pipelines-task-lib/mock-task', taskMock)

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
