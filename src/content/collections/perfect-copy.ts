import type { ContentGraph } from '../types.ts'

export const perfectCopyContent = {
  entryPoints: ['perfect-copy'],
  nodes: [
    {
      kind: 'question',
      id: 'perfect-copy',
      theme: 'identity',
      text: 'Would a perfect copy of you be another you, or someone new?',
      choices: [
        { label: 'Another me.', next: 'first-difference' },
        { label: 'Someone new.', next: 'copied-friendship' },
      ],
    },
    {
      kind: 'question',
      id: 'first-difference',
      theme: 'identity',
      text: 'Would one different memory be enough to turn your copy into someone else?',
      choices: [
        { label: 'One private moment would be enough.', next: 'shared-name' },
        { label: 'It would take more than that.', next: 'shared-promise' },
      ],
    },
    {
      kind: 'question',
      id: 'copied-friendship',
      theme: 'connection',
      text: 'Would your copy inherit your friendships, or have to begin them again?',
      choices: [
        { label: 'Those bonds would belong to both of us.', next: 'shared-promise' },
        { label: 'They would need to build their own.', next: 'shared-name' },
      ],
    },
    {
      kind: 'question',
      id: 'shared-name',
      theme: 'identity',
      text: 'If you and your copy wanted the same name, would either of you have a stronger claim?',
      choices: [
        { label: 'The person who had it first.', next: 'pause-copy' },
        { label: 'We would have an equal claim.', next: 'pause-copy' },
      ],
    },
    {
      kind: 'question',
      id: 'shared-promise',
      theme: 'connection',
      text: 'If your copy remembered making one of your promises, would they have to keep it?',
      choices: [
        { label: 'Remembering it would make it theirs too.', next: 'pause-copy' },
        { label: 'They would need to agree to it themselves.', next: 'pause-copy' },
      ],
    },
    {
      kind: 'pause',
      id: 'pause-copy',
      text: 'Your copy can wait here too. Stay with this question, or follow another rabbit hole.',
    },
  ],
} as const satisfies ContentGraph
