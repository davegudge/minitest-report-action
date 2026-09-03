import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@jest/globals'
import { parse } from '../src/parse.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test('parses a Minitest JSON result', async () => {
  const result = await parse([
    path.resolve(__dirname, '../.dummy_results-0.json')
  ])

  expect(result).toEqual({
    summary: '9 runs, 23 assertions, 2 failures, 1 error, 1 skip',
    failures: [
      {
        filePath: 'test/models/user_test.rb',
        lineNumber: 25,
        description:
          'test_account_remains_confirmed_when_setting_an_unconfirmed_email_address',
        message: 'Expected false to be truthy.',
        backtrace: []
      },
      {
        filePath: 'test/models/user_test.rb',
        lineNumber: 18,
        description: 'test_email_addresses_display',
        message:
          'Expected: "9876543213@domain.uk"\n  Actual: "987654321@domain.uk"',
        backtrace: []
      },
      {
        filePath: 'test/services/payment_test.rb',
        lineNumber: 42,
        description: 'test_payment_gateway_timeout',
        message: 'RuntimeError: payment gateway timed out',
        backtrace: [
          "test/services/payment_test.rb:42:in `test_payment_gateway_timeout'",
          "app/services/payment_service.rb:18:in `charge'"
        ]
      }
    ],
    success: false
  })
})

test('aggregates multiple Minitest JSON results', async () => {
  const result = await parse([
    path.resolve(__dirname, '../.dummy_results-0.json'),
    path.resolve(__dirname, '../.dummy_results-1.json')
  ])

  expect(result.summary).toBe(
    '12 runs, 30 assertions, 2 failures, 1 error, 2 skips'
  )
  expect(result.failures).toHaveLength(3)
  expect(result.success).toBe(false)
})

test('treats a run containing only skipped tests as successful', async () => {
  const result = await parse([
    path.resolve(__dirname, '../.dummy_results-1.json')
  ])

  expect(result).toEqual({
    summary: '3 runs, 7 assertions, 0 failures, 0 errors, 1 skip',
    failures: [],
    success: true
  })
})
