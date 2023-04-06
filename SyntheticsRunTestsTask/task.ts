import * as path from 'path'

import * as task from 'azure-pipelines-task-lib/task'

import {getReporter, resolveConfig} from './resolve-config'
import {synthetics} from '@datadog/datadog-ci'

async function run(): Promise<void> {
  task.setResourcePath(path.join(__dirname, 'task.json'))
  synthetics.utils.setCiTriggerApp('azure_devops_task')

  const reporter = getReporter()
  const config = await resolveConfig(reporter)
  const startTime = Date.now()

  let results: synthetics.Result[]
  let summary: synthetics.Summary

  try {
    ;({results, summary} = await synthetics.executeTests(reporter, config))
  } catch (error) {
    synthetics.utils.reportExitLogs(reporter, config, {error})

    const exitReason = synthetics.utils.getExitReason(config, {error})
    if (exitReason !== 'passed') {
      task.setResult(task.TaskResult.Failed, 'Running Datadog Synthetics tests failed.')
    }
    return
  }

  const orgSettings = await synthetics.utils.getOrgSettings(reporter, config)

  synthetics.utils.renderResults({
    config,
    orgSettings,
    reporter,
    results,
    startTime,
    summary,
  })

  const exitReason = synthetics.utils.getExitReason(config, {results})
  if (exitReason !== 'passed') {
    task.setResult(task.TaskResult.Failed, 'Datadog Synthetics tests failed.')
  }
}

void run().catch(e => {
  console.error('[UNCAUGHT_ERROR]', e)
  task.setResult(task.TaskResult.Failed, 'An uncaught error occurred.')
})
