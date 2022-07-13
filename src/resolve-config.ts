import {synthetics} from '@datadog/datadog-ci'

const DEFAULT_CONFIG: synthetics.CommandConfig = {
  apiKey: process.env.DATADOG_API_KEY || '',
  appKey: process.env.DATADOG_APP_KEY || '',
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

export const resolveConfig = async (): Promise<synthetics.CommandConfig> => {
  return DEFAULT_CONFIG
}
