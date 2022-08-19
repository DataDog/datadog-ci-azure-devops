import * as path from 'path'

import * as task from 'azure-pipelines-task-lib/task'
import * as util from 'azure-pipelines-tasks-packaging-common/util'

import {BaseContext} from 'clipanion'
import {synthetics} from '@datadog/datadog-ci'

import {renderResults} from './process-results'
import {reportCiError} from './report-ci-error'
import {resolveConfig} from './resolve-config'

async function run(): Promise<void> {
  task.setResourcePath(path.join(__dirname, 'task.json'))

  const context: BaseContext = {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  }

  synthetics.utils.setCiTriggerApp('azure_devops_task')
  const reporter = synthetics.utils.getReporter([new synthetics.DefaultReporter({context})])
  const config = await resolveConfig()

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
})
