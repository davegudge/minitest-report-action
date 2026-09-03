import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, jest, test } from '@jest/globals'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const getInput = jest.fn<(name: string) => string>()
const info = jest.fn()
const warning = jest.fn()
const setFailed = jest.fn()

jest.unstable_mockModule('@actions/core', () => ({
  getInput,
  info,
  warning,
  setFailed,
  debug: jest.fn(),
  setOutput: jest.fn()
}))

const reportSummary = jest.fn()
jest.unstable_mockModule('../src/report-summary.js', () => ({
  reportSummary
}))

const { run } = await import('../src/main.js')

test('parses multiple Minitest JSON results', async () => {
  getInput.mockReturnValue(path.resolve(__dirname, '../.dummy_results-*.json'))
  await run()

  expect(reportSummary).toHaveBeenCalledWith({
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
    success: false,
    summary: '12 runs, 30 assertions, 2 failures, 1 error, 2 skips'
  })
})
