import type {MinitestResult} from './parse'
import {markdownTable} from 'markdown-table'

export function failuresTable(failures: MinitestResult['failures']): string {
  return markdownTable([
    ['File', 'Message'],
    ...failures.map(({location, message}) => [
      location,
      message.replace(/\n+/g, ' ')
    ])
  ])
}
