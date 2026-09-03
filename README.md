# Minitest Report

A GitHub Action that reports Minitest failures in the job summary and,
optionally, as a pull request comment.

The report lists failed tests in a copy-friendly code block. A details section
then shows each failure message, a link to the failing line, and a project-local
backtrace when the reporter provides one. Up to 20 failures are shown; any
remaining failures are summarized as a count.

## Producing the JSON report

Minitest does not include a file-based JSON reporter. Add the reporter fork to
your `Gemfile`:

```ruby
gem "minitest-reporters-json_reporter",
  github: "davegudge/minitest-reporters-json_reporter",
  branch: "write-to-file"
```

Configure it in `test_helper.rb` (or `spec_helper.rb`):

```ruby
require "minitest/reporters/json_reporter"

Minitest::Reporters.use! [
  Minitest::Reporters::JsonReporter.new(reports_dir: "tmp/minitest")
]
```

The reporter writes the result to `tmp/minitest/output.json`.

## Inputs

| Name             | Description                                         | Default                  | Required |
| ---------------- | --------------------------------------------------- | ------------------------ | -------- |
| `json-path`      | Path or glob pattern for Minitest JSON result files |                          | yes      |
| `token`          | GitHub token                                        | `${{ github.token }}`    | no       |
| `title`          | Pull request comment title                          | `# :x: Minitest failure` | no       |
| `hideFooterLink` | Hide the action link in the job summary             | `false`                  | no       |
| `comment`        | Add or update a report comment on pull requests     | `true`                   | no       |

## Example

```yaml
name: Test
on:
  pull_request:

permissions:
  contents: read
  pull-requests: write

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      # Set up Ruby and install the bundle here.

      - name: Run Minitest
        run: bin/rails test

      - name: Minitest Report
        uses: davegudge/minitest-report-action@v8
        with:
          json-path: tmp/minitest/output.json
        if: always()
```

Set `comment: false` if you only want the job summary. Glob patterns such as
`tmp/minitest/**/*.json` can combine results produced by parallel test jobs.
