import path from 'path'

interface JsonResult {
  status: Status
  metadata: MetaData
  statistics: Statistics
  fails: Failure[]
}

interface Failure {
  type: string
  class: string
  name: string
  assertions: number
  time: number
  file: string
  line_number: number
  message: string
  location: string
}

interface Statistics {
  total: number
  assertions: number
  failures: number
  errors: number
  skips: number
  passes: number
}

interface MetaData {
  generated_by: string
  version: string
  ruby_version: string
  ruby_patchlevel: number
  ruby_platform: string
  time: string
}

interface Status {
  code: string
  color: string
}

type FailureOutput = {
  name: string
  location: string
  message: string
}

export type MinitestResult = {
  failures: FailureOutput[]
  summary: string
  success: boolean
}

export function parse(resultPath: string): MinitestResult {
  // eslint-disable-next-line import/no-dynamic-require,@typescript-eslint/no-var-requires,@typescript-eslint/no-require-imports
  const json = require(path.resolve(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.GITHUB_WORKSPACE!,
    resultPath
  )) as JsonResult

  const failures: FailureOutput[] = json.fails.map(
    ({name, location, message}) => {
      return {
        name,
        location,
        message
      }
    }
  )

  return {
    failures,
    summary: `${json.statistics.assertions} assertions, ${json.statistics.failures} failures`,
    success: failures.length === 0
  }
}
