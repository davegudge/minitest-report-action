# Minitest Report

A GitHub Action that reports Minitest failures.

![Example](https://user-images.githubusercontent.com/1736807/161021237-1c64cce7-edec-4943-92db-b18f92fcada8.png)

## Usage

This action utilises the Minitest test in a json format. Minitest does not appear to have [a built in] option to output to a json file. json output can be achieve by adding the following to the `Gemfile`:

```ruby
  gem "minitest-reporters-json_reporter", github: "davegudge/minitest-reporters-json_reporter", branch: "write-to-file"
```

And then executing:

```ruby
bundle install
```

The following will need to be addded to `spec_helper.rb` or `test_helper.rb`:

```ruby
require 'minitest/reporters/json_reporter'

...

Minitest::Reporters.use! [Minitest::Reporters::JsonReporter.new(reports_dir: "tmp/minitest")]
```

## Example

Below is an example of how to use setup the GitHub action:

### Inputs

- `token` - The GITHUB_TOKEN secret.
- `json-path` - Path to Minitest result json file.

```yaml
name: Build
on:
  pull_request:

jobs:
  tests:
    steps:
      - name: Run Minitest
        run: bin/rails test

      - name: Minitest Report
        uses: davegudge/minitest-report-action@v1.0.0
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          json-path: tmp/minitest/output.json
```
