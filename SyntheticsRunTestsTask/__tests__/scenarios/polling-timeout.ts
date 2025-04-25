import {join} from 'path'

import {TaskMockRunner} from 'azure-pipelines-task-lib/mock-run'

import {BASE_INPUTS, CUSTOM_PUBLIC_IDS, setupMocks} from '../fixtures'

const mockRunner = new TaskMockRunner(join(__dirname, '../..', 'task.js'))

setupMocks(mockRunner)

mockRunner.setInput('authenticationType', 'apiAppKeys')
mockRunner.setInput('apiKey', BASE_INPUTS.apiKey)
mockRunner.setInput('appKey', BASE_INPUTS.appKey)
mockRunner.setInput('publicIds', CUSTOM_PUBLIC_IDS.join(', '))
mockRunner.setInput('pollingTimeout', `${60 * 60 * 1000}`)

mockRunner.run()
