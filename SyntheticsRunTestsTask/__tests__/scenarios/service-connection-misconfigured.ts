import {join} from 'path'

import {TaskMockRunner} from 'azure-pipelines-task-lib/mock-run'

import {setupWarnSpy} from '../fixtures'

setupWarnSpy()

const mockRunner = new TaskMockRunner(join(__dirname, '../..', 'task.js'))

mockRunner.setInput('authenticationType', 'connectedService')
mockRunner.setInput('connectedService', 'my service connection')
mockRunner.run()
