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

    const baseUrl = synthetics.utils.getAppBaseURL(config)
    const batchUrl = synthetics.utils.getBatchUrl(baseUrl, summary.batchId)

    setOutputs(results, summary, batchUrl)

    const exitReason = synthetics.utils.getExitReason(config, {results})
    if (exitReason !== 'passed') {
      task.setResult(task.TaskResult.Failed, `Datadog Synthetics tests failed: ${getTextSummary(summary, batchUrl)}`)
    } else {
      task.setResult(
        task.TaskResult.Succeeded,
        `Datadog Synthetics tests succeeded: ${getTextSummary(summary, batchUrl)}`
      )
    }
  } catch (error) {
    synthetics.utils.reportExitLogs(reporter, config, {error})

    const exitReason = synthetics.utils.getExitReason(config, {error})
    if (exitReason !== 'passed') {
      task.setResult(task.TaskResult.Failed, 'Running Datadog Synthetics tests failed.')
    }
  }
}

const getTextSummary = (summary: synthetics.Summary, batchUrl: string): string =>
  `criticalErrors: ${summary.criticalErrors}, passed: ${summary.passed}, previouslyPassed: ${summary.previouslyPassed}, failedNonBlocking: ${summary.failedNonBlocking}, failed: ${summary.failed}, skipped: ${summary.skipped}, notFound: ${summary.testsNotFound.size}, timedOut: ${summary.timedOut}\n` +
  `Batch URL: ${batchUrl}`

const setOutputs = (results: synthetics.Result[], summary: synthetics.Summary, batchUrl: string): void => {
  task.setVariable('batchUrl', batchUrl, false, true)
  task.setVariable('criticalErrorsCount', summary.criticalErrors.toString(), false, true)
  task.setVariable('failedNonBlockingCount', summary.failedNonBlocking.toString(), false, true)
  task.setVariable('failedCount', summary.failed.toString(), false, true)
  task.setVariable('passedCount', summary.passed.toString(), false, true)
  task.setVariable('previouslyPassedCount', summary.previouslyPassed.toString(), false, true)
  task.setVariable('testsNotFoundCount', summary.testsNotFound.size.toString(), false, true)
  task.setVariable('testsSkippedCount', summary.skipped.toString(), false, true)
  task.setVariable('timedOutCount', summary.timedOut.toString(), false, true)
  task.setVariable('rawResults', JSON.stringify(results), false, true)
}

void run().catch(e => {
  console.error('[UNCAUGHT_ERROR]', e)
  task.setResult(task.TaskResult.Failed, 'An uncaught error occurred.')
})
