import {logError, LogType} from 'azure-pipelines-tasks-packaging-common/util'

logError(
  'Node 10 support for SyntheticsRunTestsTask is deprecated, please upgrade the agent version.\n' +
    'See https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/agents#agent-version-and-upgrades',
  LogType.warning
)

require('./task')
