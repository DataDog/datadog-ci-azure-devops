import * as task from 'azure-pipelines-task-lib/task'

task.warning(
  `Node 16 support for the \`SyntheticsRunTests\` task is deprecated.

You may upgrade your agent or manually install a Node runner with the \`NodeTaskRunnerInstaller\` task.
See https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/agents#node-runner-versions`
)

require('./task')
