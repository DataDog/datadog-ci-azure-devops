import * as path from 'path'

import * as tl from 'azure-pipelines-task-lib/task'

async function run(): Promise<void> {
  tl.setResourcePath(path.join(__dirname, '../task/task.json'))
  tl.debug('Hello World!')
}

run()
