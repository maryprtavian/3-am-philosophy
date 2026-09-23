import type { ContentGraph } from '../types.ts'

export const perfectDreamContent = {
  entryPoints: ['perfect-dream'],
  nodes: [
    {
      kind: 'question',
      id: 'perfect-dream',
      theme: 'reality',
      text: 'Would you stay in a perfect dream if waking meant an ordinary life?',
      choices: [
        { label: 'I would stay in the dream.', next: 'dream-surprise' },
        { label: 'I would choose to wake up.', next: 'waking-proof' },
      ],
    },
    {
      kind: 'question',
      id: 'dream-surprise',
      theme: 'reality',
      text: 'Would a dream still feel perfect if nothing in it could surprise you?',
      choices: [
        { label: 'I would miss being surprised.', next: 'unexpected-guest' },
        { label: 'Peace could be enough.', next: 'dream-storm' },
      ],
    },
    {
      kind: 'question',
      id: 'waking-proof',
      theme: 'reality',
      text: 'What would convince you that you had really woken up?',
      choices: [
        { label: 'Something I could not control.', next: 'dream-storm' },
        { label: 'Someone who could check with me.', next: 'shared-dream' },
      ],
    },
    {
      kind: 'question',
      id: 'unexpected-guest',
      theme: 'reality',
      text: 'If a stranger in your dream refused to follow your wishes, would that make them more real?',
      choices: [
        { label: 'Their independence would matter.', next: 'dream-goodbye' },
        { label: 'A surprise could still be part of the dream.', next: 'dream-evidence' },
      ],
    },
    {
      kind: 'question',
      id: 'dream-storm',
      theme: 'reality',
      text: 'If a dream could hurt as well as delight you, would that make it more believable?',
      choices: [
        { label: 'The risk would make it feel real.', next: 'dream-goodbye' },
        { label: 'Pain would not prove anything.', next: 'dream-evidence' },
      ],
    },
    {
      kind: 'question',
      id: 'shared-dream',
      theme: 'reality',
      text: 'If everyone you met agreed the world was real, would their certainty settle it for you?',
      choices: [
        { label: 'Shared experience would be enough.', next: 'dream-goodbye' },
        { label: 'Agreement could be part of the dream.', next: 'dream-evidence' },
      ],
    },
    {
      kind: 'question',
      id: 'dream-goodbye',
      theme: 'connection',
      text: 'Would saying goodbye to someone in a dream count as a real goodbye?',
      choices: [
        { label: 'The feeling would make it real.', next: 'pause-dream' },
        { label: 'I would need someone real on the other side.', next: 'pause-dream' },
      ],
    },
    {
      kind: 'question',
      id: 'dream-evidence',
      theme: 'reality',
      text: 'If every test left room for doubt, would you keep testing whether you were dreaming?',
      choices: [
        { label: 'I would keep looking for firmer ground.', next: 'pause-dream' },
        { label: 'I could live with some doubt.', next: 'pause-dream' },
      ],
    },
    {
      kind: 'pause',
      id: 'pause-dream',
      text: 'The world can stay a little strange. Let this question linger, or follow another rabbit hole.',
    },
  ],
} as const satisfies ContentGraph
