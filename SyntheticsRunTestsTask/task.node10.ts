import * as task from 'azure-pipelines-task-lib/task'

task.warning(
  'Node 10 support for SyntheticsRunTestsTask is deprecated, please upgrade the agent version.\n' +
    'See https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/agents#agent-version-and-upgrades'
)

require('./task')
