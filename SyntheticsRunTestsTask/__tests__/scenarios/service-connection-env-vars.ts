import {join} from 'path'

import {TaskMockRunner} from 'azure-pipelines-task-lib/mock-run'

import {BASE_INPUTS, CUSTOM_PUBLIC_IDS, CUSTOM_SITE, CUSTOM_SUBDOMAIN, setupMocks} from '../fixtures'

const mockRunner = new TaskMockRunner(join(__dirname, '../..', 'task.js'))

setupMocks(mockRunner)

const CONNECTED_SERVICE_NAME = 'foo'

process.env['INPUT_AUTHENTICATIONTYPE'] = 'connectedService'
process.env['INPUT_CONNECTEDSERVICE'] = CONNECTED_SERVICE_NAME
process.env['INPUT_PUBLICIDS'] = CUSTOM_PUBLIC_IDS.join(', ')

process.env[`ENDPOINT_URL_${CONNECTED_SERVICE_NAME}`] = `https://app.${CUSTOM_SITE}/`
process.env[`ENDPOINT_AUTH_PARAMETER_${CONNECTED_SERVICE_NAME.toLocaleUpperCase()}_APITOKEN`] = BASE_INPUTS.apiKey
process.env[`ENDPOINT_AUTH_PARAMETER_${CONNECTED_SERVICE_NAME.toLocaleUpperCase()}_APPKEY`] = BASE_INPUTS.appKey
process.env[`ENDPOINT_DATA_${CONNECTED_SERVICE_NAME}_SUBDOMAIN`] = CUSTOM_SUBDOMAIN

mockRunner.run()
