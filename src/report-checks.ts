import * as core from '@actions/core'
import * as github from '@actions/github'
import type {MinitestResult} from './parse'
import {failuresTable} from './table'

export const reportChecks = async (result: MinitestResult): Promise<void> => {
  const icon = result.success ? ':white_check_mark:' : ':x:'
  const summary = `${icon} ${result.summary}

${failuresTable(result.failures)}
`

  await github
    .getOctokit(core.getInput('token', {required: true}))
    .rest.checks.create({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      name: 'Minitest Result',
      head_sha: github.context.sha,
      status: 'completed',
      conclusion: result.success ? 'success' : 'failure',
      output: {
        title: 'Minitest Result',
        summary
      }
    })
}
