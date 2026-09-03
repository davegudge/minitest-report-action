import * as core from '@actions/core'
import type { MinitestResult } from './parse.js'
import { buildBaseUrl, formatFailureList } from './format.js'

const FOOTER_LINK =
  'Reported by [minitest-report-action](https://github.com/davegudge/minitest-report-action)'

export const reportSummary = async (result: MinitestResult): Promise<void> => {
  const icon = result.success ? ':white_check_mark:' : ':x:'
  const summary = `${icon} ${result.summary}`
  const hideFooterLink = core.getInput('hideFooterLink') === 'true'

  await core.summary
    .addHeading('Minitest Result')
    .addRaw(summary)
    .addRaw(`\n\n${formatFailureList(result.failures, buildBaseUrl())}\n`)
    .addRaw(hideFooterLink ? '' : `\n${FOOTER_LINK}`)
    .write()
}
