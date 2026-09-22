import type { ContentGraph } from './types'

/** Minimal contract example for authors and validator tests; not part of the playable library. */
export const exampleContent = {
  entryPoints: ['immortality'],
  nodes: [
    {
      kind: 'question',
      id: 'immortality',
      theme: 'time',
      text: 'Would immortality eventually make everything meaningless?',
      choices: [
        { label: 'Eventually, yes.', next: 'fleeting-moments' },
        { label: 'There would always be more.', next: 'another-century' },
      ],
    },
    {
      kind: 'question',
      id: 'fleeting-moments',
      theme: 'meaning',
      text: 'Does a moment matter because it ends, or because you were there?',
      choices: [
        { label: 'Because it ends.', next: 'open-question' },
        { label: 'Because I was there.', next: 'open-question' },
      ],
    },
    {
      kind: 'question',
      id: 'another-century',
      theme: 'identity',
      text: 'If you had to forget a century to live another, would you still choose forever?',
      choices: [
        { label: 'I could become someone new.', next: 'open-question' },
        { label: 'I would lose too much of myself.', next: 'open-question' },
      ],
    },
    {
      kind: 'pause',
      id: 'open-question',
      text: 'Some thoughts are worth taking with you.',
    },
  ],
} as const satisfies ContentGraph
