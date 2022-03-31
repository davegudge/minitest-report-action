import * as path from 'path'
import {parse} from '../src/parse'
import {failuresTable} from '../src/table'
import {expect, test} from '@jest/globals'

test('Parse minitest result json', async () => {
  const result = await parse(
    path.resolve(__dirname, '../.example_results.json')
  )
  expect(result).toEqual({
    failures: [
      {
        location: 'test/models/user_test.rb:25',
        message: 'Expected false to be truthy.',
        name: 'test_account_remains_confirmed_when_setting_an_unconfirmed_email_address'
      },
      {
        location: 'test/models/user_test.rb:18',
        message:
          'Expected: "9876543213@domain.uk" Actual: "987654321@domain.uk"',
        name: 'test_email_addresses_display'
      }
    ],
    success: false,
    summary: '23 assertions, 2 failures'
  })
})

test('failuresTable', () => {
  const failures = [
    {
      name: 'test_name',
      location: './test_spec.rb:12',
      message: 'an error message'
    }
  ]
  expect(failuresTable(failures))
    .toEqual(`| File              | Message          |
| ----------------- | ---------------- |
| ./test_spec.rb:12 | an error message |`)
})
