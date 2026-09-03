import { expect, jest, test, describe } from '@jest/globals'

jest.unstable_mockModule('@actions/github', () => ({
  context: {
    serverUrl: 'https://github.com',
    sha: 'abc123',
    repo: { owner: 'owner', repo: 'repo' }
  }
}))

const { buildBaseUrl, formatFailureList } = await import('../src/format.js')

const baseUrl = 'https://github.com/owner/repo/blob/abc123'

const failure = (overrides = {}) => ({
  filePath: 'test/models/foo_test.rb',
  lineNumber: 18,
  description: 'test_foo_is_valid',
  message: 'expected true\n     got: false',
  backtrace: ["test/models/foo_test.rb:18:in 'test_foo_is_valid'"],
  ...overrides
})

describe('buildBaseUrl', () => {
  test('builds blob base url from github context', () => {
    expect(buildBaseUrl()).toBe(baseUrl)
  })
})

describe('formatFailureList', () => {
  test('keeps the message unprocessed (trimmed, newlines intact, no &nbsp;)', () => {
    const result = formatFailureList(
      [
        failure({
          message: '\nexpected: true\n     got: false\n\n(compared using ==)'
        })
      ],
      baseUrl
    )
    expect(result).toContain(
      'expected: true\n     got: false\n\n(compared using ==)'
    )
    expect(result).not.toContain('&nbsp;')
  })

  test('renders a plain list line and a single details with linked heading and merged message/backtrace', () => {
    const result = formatFailureList([failure()], baseUrl)
    // 初期表示はリンクなしのプレーン行（path:line description）
    expect(result).toContain('test/models/foo_test.rb:18 test_foo_is_valid')
    // details はちょうど 1 個
    expect(result.match(/<details>/g)?.length).toBe(1)
    expect(result).toContain('<details><summary>Details</summary>')
    // 見出しはリンク + description
    expect(result).toContain(
      `### [test/models/foo_test.rb:18](${baseUrl}/test/models/foo_test.rb#L18) test_foo_is_valid`
    )
    // message と backtrace は同一コードブロック内に空行区切りで連結
    expect(result).toContain(
      "expected true\n     got: false\n\ntest/models/foo_test.rb:18:in 'test_foo_is_valid'"
    )
  })

  test('keeps message and backtrace in a single code block (no extra block when backtrace empty)', () => {
    const withBacktrace = formatFailureList([failure()], baseUrl)
    const withoutBacktrace = formatFailureList(
      [failure({ backtrace: [] })],
      baseUrl
    )
    expect(withoutBacktrace).toContain('expected true\n     got: false')
    // backtrace の有無に関わらずブロック数は同じ（リスト用1 + details用1 = ``` が計4個）
    expect(withBacktrace.match(/```/g)?.length).toBe(4)
    expect(withoutBacktrace.match(/```/g)?.length).toBe(4)
  })

  test('caps the list at the limit and reports the remaining count', () => {
    const failures = Array.from({ length: 23 }, (_, i) =>
      failure({ lineNumber: i + 1 })
    )
    const result = formatFailureList(failures, baseUrl, 20)
    expect(result).toContain('... and 3 more failures')
    // details はまとめて 1 個
    expect(result.match(/<details>/g)?.length).toBe(1)
    // details 内のリンク付き見出しは 20 個
    expect(result.match(/### \[/g)?.length).toBe(20)
  })

  test('does not add the more-failures line within the limit', () => {
    const failures = [failure(), failure({ lineNumber: 19 })]
    const result = formatFailureList(failures, baseUrl, 20)
    expect(result).not.toContain('more failures')
  })
})
