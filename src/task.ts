import * as path from 'path'

import * as tl from 'azure-pipelines-task-lib/task'
import * as util from 'azure-pipelines-tasks-packaging-common/util'

import {BaseContext} from 'clipanion'
import {renderResults} from './process-results'
import {reportCiError} from './report-ci-error'
import {resolveConfig} from './resolve-config'
import {synthetics} from '@datadog/datadog-ci'

async function run(): Promise<void> {
  tl.setResourcePath(path.join(__dirname, '../task/task.json'))

  const context: BaseContext = {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  }

  synthetics.utils.setCiTriggerApp('github_action')
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
      tl.setResult(tl.TaskResult.Failed, `Datadog Synthetics tests failed : ${printSummary(resultSummary)}`)
    } else {
      tl.setResult(tl.TaskResult.Succeeded, `Datadog Synthetics tests succeeded : ${printSummary(resultSummary)}`)
    }
  } catch (error) {
    if (error instanceof synthetics.CiError) {
      reportCiError(error, reporter)
    } else {
      util.logError(`Internal error: ${String(error)}`)
    }
    tl.setResult(tl.TaskResult.Failed, 'Running Datadog Synthetics tests failed.')
  }
}

export const printSummary = (summary: synthetics.Summary): string =>
  `criticalErrors: ${summary.criticalErrors}, passed: ${summary.passed}, failedNonBlocking: ${summary.failedNonBlocking}, failed: ${summary.failed}, skipped: ${summary.skipped}, notFound: ${summary.testsNotFound.size}, timedOut: ${summary.timedOut}`

if (require.main === module) {
  run()
}

export default run
