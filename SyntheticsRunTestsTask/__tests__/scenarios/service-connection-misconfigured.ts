import {join} from 'path'

import {TaskMockRunner} from 'azure-pipelines-task-lib/mock-run'

import {setupMocks} from '../fixtures'

const mockRunner = new TaskMockRunner(join(__dirname, '../..', 'task.js'))

setupMocks(mockRunner)

mockRunner.setInput('authenticationType', 'connectedService')
mockRunner.setInput('connectedService', 'my service connection')
mockRunner.run()
