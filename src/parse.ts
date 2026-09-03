import path from 'node:path'
import { readFile } from 'node:fs/promises'

interface Statistics {
  total: number
  assertions: number
  failures: number
  errors: number
  skips: number
  passes: number
}

interface Failure {
  type: 'failed' | 'error'
  class: string
  name: string
  assertions: number
  time: number
  file: string
  line_number: number
  message: string
  location: string
  backtrace?: string[]
}

interface JsonResult {
  statistics: Statistics
  fails: Failure[]
}

type FailureOutput = {
  filePath: string
  lineNumber: number
  description: string
  message: string
  backtrace: string[]
}

export type MinitestResult = {
  failures: FailureOutput[]
  summary: string
  success: boolean
}

const MAX_BACKTRACE_LINES = 10

const NON_PROJECT_BACKTRACE =
  /[/\\](gems|ruby|\.rbenv|\.rvm|\.bundle|vendor[/\\]bundle)[/\\]/

function extractProjectBacktrace(backtrace: string[]): string[] {
  const relative = backtrace.filter((line) => line.startsWith('./'))
  const lines =
    relative.length > 0
      ? relative
      : backtrace.filter((line) => !NON_PROJECT_BACKTRACE.test(line))
  return lines.slice(0, MAX_BACKTRACE_LINES)
}

function normalizeFilePath(filePath: string): string {
  const workspace = process.env.GITHUB_WORKSPACE
  let normalized = filePath

  if (workspace && path.isAbsolute(normalized)) {
    const relative = path.relative(workspace, normalized)
    if (!relative.startsWith('..') && !path.isAbsolute(relative)) {
      normalized = relative
    }
  }

  return normalized.replace(/^\.[/\\]/, '').replaceAll('\\', '/')
}

function failureLocation(failure: Failure): {
  filePath: string
  lineNumber: number
} {
  const match = failure.location.match(/^(.*):(\d+)$/)
  if (match) {
    return {
      filePath: normalizeFilePath(match[1]),
      lineNumber: Number(match[2])
    }
  }

  return {
    filePath: normalizeFilePath(failure.file),
    lineNumber: failure.line_number
  }
}

function pluralize(noun: string, count: number): string {
  if (count === 1) return noun
  return `${noun}s`
}

function generateSummary(statistics: Statistics): string {
  const { total, assertions, failures, errors, skips } = statistics
  return [
    `${total} ${pluralize('run', total)}`,
    `${assertions} ${pluralize('assertion', assertions)}`,
    `${failures} ${pluralize('failure', failures)}`,
    `${errors} ${pluralize('error', errors)}`,
    `${skips} ${pluralize('skip', skips)}`
  ].join(', ')
}

function addStatistics(total: Statistics, current: Statistics): Statistics {
  return {
    total: total.total + current.total,
    assertions: total.assertions + current.assertions,
    failures: total.failures + current.failures,
    errors: total.errors + current.errors,
    skips: total.skips + current.skips,
    passes: total.passes + current.passes
  }
}

export async function parse(resultPaths: string[]): Promise<MinitestResult> {
  const results = await Promise.all(
    resultPaths.map(async (resultPath) => {
      return JSON.parse(
        await readFile(
          path.resolve(process.env.GITHUB_WORKSPACE!, resultPath),
          'utf-8'
        )
      ) as JsonResult
    })
  )

  const statistics = results.reduce(
    (total, result) => addStatistics(total, result.statistics),
    {
      total: 0,
      assertions: 0,
      failures: 0,
      errors: 0,
      skips: 0,
      passes: 0
    }
  )

  const failures = results.flatMap((result) =>
    result.fails.map((failure) => ({
      ...failureLocation(failure),
      description: failure.name,
      message: failure.message,
      backtrace: extractProjectBacktrace(failure.backtrace ?? [])
    }))
  )

  return {
    failures,
    summary: generateSummary(statistics),
    success: statistics.failures + statistics.errors === 0
  }
}
