import * as path from 'path'
import * as fs from 'fs'
import * as task from 'azure-pipelines-task-lib/task'

import {getReporter, resolveConfig} from './resolve-config'
import {synthetics} from '@datadog/datadog-ci'

async function run(): Promise<void> {
  task.setResourcePath(path.join(__dirname, 'task.json'))
  synthetics.utils.setCiTriggerApp('azure_devops_task')

  const taskJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'task.json')).toString())

  console.log(
    'TEST: I AM THE LATEST TASK VERSION',
    JSON.stringify({
      hardcodedTaskId: '60b18503-c6d6-4e4b-a6b2-52fc6fb3d525',
      actualTaskId: taskJson.id,
      version: taskJson.version,
      manualSequence: 5,
    })
  )

  const reporter = getReporter()
  const config = await resolveConfig(reporter)
  const startTime = Date.now()

  try {
    const {results, summary} = await synthetics.executeTests(reporter, config)
    const orgSettings = await synthetics.utils.getOrgSettings(reporter, config)

    synthetics.utils.renderResults({
      config,
      orgSettings,
      reporter,
      results,
      startTime,
      summary,
    })

    synthetics.utils.reportExitLogs(reporter, config, {results})

    const exitReason = synthetics.utils.getExitReason(config, {results})
    if (exitReason !== 'passed') {
      task.setResult(task.TaskResult.Failed, `Datadog Synthetics tests failed: ${printSummary(summary, config)}`)
    } else {
      task.setResult(task.TaskResult.Succeeded, `Datadog Synthetics tests succeeded: ${printSummary(summary, config)}`)
    }
  } catch (error) {
    synthetics.utils.reportExitLogs(reporter, config, {error})

    const exitReason = synthetics.utils.getExitReason(config, {error})
    if (exitReason !== 'passed') {
      task.setResult(task.TaskResult.Failed, 'Running Datadog Synthetics tests failed.')
    }
  }
}

export const printSummary = (summary: synthetics.Summary, config: synthetics.SyntheticsCIConfig): string => {
  const baseUrl = synthetics.utils.getAppBaseURL(config)
  const batchUrl = synthetics.utils.getBatchUrl(baseUrl, summary.batchId)
  return (
    `criticalErrors: ${summary.criticalErrors}, passed: ${summary.passed}, failedNonBlocking: ${summary.failedNonBlocking}, failed: ${summary.failed}, skipped: ${summary.skipped}, notFound: ${summary.testsNotFound.size}, timedOut: ${summary.timedOut}\n` +
    `Results URL: ${batchUrl}`
  )
}

void run().catch(e => {
  console.error('[UNCAUGHT_ERROR]', e)
  task.setResult(task.TaskResult.Failed, 'An uncaught error occurred.')
})
