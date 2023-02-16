import * as path from 'path'

import * as task from 'azure-pipelines-task-lib/task'
import * as util from 'azure-pipelines-tasks-packaging-common/util'

import {synthetics} from '@datadog/datadog-ci'

import {renderResults} from './process-results'
import {reportCiError} from './report-ci-error'
import {getReporter, resolveConfig} from './resolve-config'

async function run(): Promise<void> {
  task.setResourcePath(path.join(__dirname, 'task.json'))
  synthetics.utils.setCiTriggerApp('azure_devops_task')

  const reporter = getReporter()
  const config = await resolveConfig(reporter)

  try {
    const startTime = Date.now()
    const {results, summary} = await synthetics.executeTests(reporter, config)
    const resultSummary = renderResults({config, reporter, results, startTime, summary})
    if (
      resultSummary.criticalErrors > 0 ||
      resultSummary.failed > 0 ||
      resultSummary.timedOut > 0 ||
      resultSummary.testsNotFound.size > 0
    ) {
      task.setResult(task.TaskResult.Failed, `Datadog Synthetics tests failed : ${printSummary(resultSummary)}`)
    } else {
      task.setResult(task.TaskResult.Succeeded, `Datadog Synthetics tests succeeded : ${printSummary(resultSummary)}`)
    }
  } catch (error) {
    if (error instanceof synthetics.CiError) {
      reportCiError(error, reporter)
    } else {
      util.logError(`Internal error: ${String(error)}`)
    }
    task.setResult(task.TaskResult.Failed, 'Running Datadog Synthetics tests failed.')
  }
}

export const printSummary = (summary: synthetics.Summary): string =>
  `criticalErrors: ${summary.criticalErrors}, passed: ${summary.passed}, failedNonBlocking: ${summary.failedNonBlocking}, failed: ${summary.failed}, skipped: ${summary.skipped}, notFound: ${summary.testsNotFound.size}, timedOut: ${summary.timedOut}`

void run().catch(e => {
  console.error('[UNCAUGHT_ERROR]', e)
  task.setResult(task.TaskResult.Failed, 'An uncaught error occurred.')
})
