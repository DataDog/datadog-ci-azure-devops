import {join} from 'path'

import {synthetics} from '@datadog/datadog-ci'
import {TaskMockRunner} from 'azure-pipelines-task-lib/mock-run'
import type task from 'azure-pipelines-task-lib/task'

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

mockRunner.setInput('authenticationType', 'connectedService')
mockRunner.setInput('connectedService', 'my service connection')
mockRunner.setInput('publicIds', CUSTOM_PUBLIC_IDS.join(', '))
mockRunner.setInput('variables', 'FOO=bar')

const taskMock: typeof task = Object.assign({}, require('azure-pipelines-task-lib/mock-task'))
taskMock.getEndpointUrlRequired = () => `https://app.${CUSTOM_SITE}/`

taskMock.getEndpointDataParameter = (_id: string, key: string, _optional: boolean) => {
  if (key === 'subdomain') {
    return CUSTOM_SUBDOMAIN
  }
}
taskMock.getEndpointAuthorizationParameterRequired = (_id: string, key: string) => {
  switch (key) {
    case 'apitoken':
      return BASE_INPUTS.apiKey
    case 'appkey':
      return BASE_INPUTS.appKey
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
        summary: EMPTY_SUMMARY,
      }
    },
  },
})

mockRunner.run()
