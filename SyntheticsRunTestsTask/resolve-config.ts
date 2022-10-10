import * as task from 'azure-pipelines-task-lib/task'

import {synthetics, utils} from '@datadog/datadog-ci'
import deepExtend from 'deep-extend'

import {parseMultiline, removeUndefinedValues} from './utils'

const DEFAULT_CONFIG: synthetics.CommandConfig = {
  apiKey: '',
  appKey: '',
  configPath: 'datadog-ci.json',
  datadogSite: 'datadoghq.com',
  failOnCriticalErrors: false,
  failOnTimeout: false,
  files: ['{,!(node_modules)/**/}*.synthetics.json'],
  global: {},
  locations: [],
  pollingTimeout: 2 * 60 * 1000,
  proxy: {protocol: 'http'},
  publicIds: [],
  subdomain: 'app',
  tunnel: false,
  variableStrings: [],
}

const ENDPOINT_URL_TO_SITE = {
  'https://app.datadoghq.com/': 'datadoghq.com',
  'https://us3.datadoghq.com/': 'us3.datadoghq.com',
  'https://us5.datadoghq.com/': 'us5.datadoghq.com',
  'https://app.datadoghq.eu/': 'datadoghq.eu',
  'https://app.ddog-gov.com/': 'ddog-gov.com',
}

type EndpointUrl = keyof typeof ENDPOINT_URL_TO_SITE

function resolveKeys(): {apiKey: string; appKey: string} {
  const authenticationType = task.getInput('authenticationType')

  switch (authenticationType) {
    case 'connectedService':
      try {
        const serviceId = task.getInputRequired('connectedService')
        const apiKey = task.getEndpointAuthorizationParameterRequired(serviceId, 'apitoken')
        const appKey = task.getEndpointAuthorizationParameterRequired(serviceId, 'appkey')
        return {apiKey, appKey}
      } catch (error) {
        task.setResult(
          task.TaskResult.Failed,
          'Missing API or APP keys to initialize datadog-ci! Check your Datadog service connection.'
        )
        throw error
      }

    case 'apiAppKeys':
      try {
        const apiKey = task.getInputRequired('apiKey')
        const appKey = task.getInputRequired('appKey')
        return {apiKey, appKey}
      } catch (error) {
        task.setResult(task.TaskResult.Failed, 'Missing API or APP keys to initialize datadog-ci!')
        throw error
      }

    default:
      task.setResult(task.TaskResult.Failed, `Unknown authentication type: ${authenticationType}`)
      throw Error('Unknown authentication type')
  }
}

function resolveDatadogEndpoint(): {datadogSite?: string; subdomain?: string} {
  const authenticationType = task.getInput('authenticationType')

  if (authenticationType === 'apiAppKeys') {
    const datadogSite = task.getInput('datadogSite')
    const subdomain = task.getInput('subdomain')
    return {datadogSite, subdomain}
  }

  const serviceId = task.getInputRequired('connectedService')
  const endpointUrl = task.getEndpointUrlRequired(serviceId) as EndpointUrl
  const datadogSite = ENDPOINT_URL_TO_SITE[endpointUrl]
  const subdomain = task.getEndpointDataParameter(serviceId, 'subdomain', true)

  return {datadogSite, subdomain}
}

export const resolveConfig = async (reporter: synthetics.MainReporter): Promise<synthetics.CommandConfig> => {
  const {apiKey, appKey} = resolveKeys()
  const {datadogSite, subdomain} = resolveDatadogEndpoint()

  const publicIds = parseMultiline(task.getInput('publicIds'))
  const configPath = task.getPathInput('configPath')
  const files = parseMultiline(task.getInput('files'))
  const testSearchQuery = task.getInput('testSearchQuery')
  const variableStrings = parseMultiline(task.getInput('variables'))

  let config = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
  // Override with file config variables
  try {
    config = await utils.resolveConfigFromFile(config, {configPath, defaultConfigPath: DEFAULT_CONFIG.configPath})
  } catch (error) {
    if (configPath) {
      task.setResult(task.TaskResult.Failed, `Unable to parse config file! Please verify config path : ${configPath}`)
      throw error
    }
    // Here, if configPath is not present it means that default config file does not exist: in this case it's expected for the task to be silent.
  }

  // Override with the task's inputs
  config = deepExtend(
    config,
    removeUndefinedValues({
      apiKey,
      appKey,
      configPath,
      datadogSite,
      files,
      publicIds,
      subdomain,
      testSearchQuery,
      global: deepExtend(
        config.global,
        removeUndefinedValues({
          variables: synthetics.utils.parseVariablesFromCli(variableStrings, reporter.log.bind(reporter)),
        })
      ),
    })
  )

  return config
}
