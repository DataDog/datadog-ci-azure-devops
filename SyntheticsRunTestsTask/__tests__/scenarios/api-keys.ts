import {join} from 'path'

import {TaskMockRunner} from 'azure-pipelines-task-lib/mock-run'

import {BASE_INPUTS, CUSTOM_PUBLIC_IDS, EMPTY_SUMMARY, setupMocks} from '../fixtures'
import {synthetics} from '@datadog/datadog-ci'

const mockRunner = new TaskMockRunner(join(__dirname, '../..', 'task.js'))

setupMocks(mockRunner, {
  executeTestsResult: {
    results: [
      {passed: true, result: {start_url: 'https://example.org'} as synthetics.ServerResult} as synthetics.Result,
    ],
    summary: {
      ...EMPTY_SUMMARY,
      batchId: 'batch-id',
      criticalErrors: 1,
      failed: 2,
      failedNonBlocking: 3,
      passed: 4,
      previouslyPassed: 5,
      skipped: 6,
      testsNotFound: new Set(['test-not-found']),
      timedOut: 7,
    },
  },
  noOpRenderResults: true,
})

mockRunner.setInput('authenticationType', 'apiAppKeys')
mockRunner.setInput('apiKey', BASE_INPUTS.apiKey)
mockRunner.setInput('appKey', BASE_INPUTS.appKey)
mockRunner.setInput('publicIds', CUSTOM_PUBLIC_IDS.join(', '))

mockRunner.run()
