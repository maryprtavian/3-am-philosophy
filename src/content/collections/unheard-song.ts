import type { ContentGraph } from '../types.ts'

export const unheardSongContent = {
  entryPoints: ['unheard-song'],
  nodes: [
    {
      kind: 'question',
      id: 'unheard-song',
      theme: 'meaning',
      text: 'If a song were never heard, could it still be beautiful?',
      choices: [
        { label: 'Beauty would be there anyway.', next: 'accidental-song' },
        { label: 'It would need a listener.', next: 'last-listener' },
      ],
    },
    {
      kind: 'question',
      id: 'accidental-song',
      theme: 'meaning',
      text: 'If a machine wrote a beautiful song by accident, would the accident change its value?',
      choices: [
        { label: 'The song could speak for itself.', next: 'unclaimed-art' },
        { label: 'The intention would matter.', next: 'private-purpose' },
      ],
    },
    {
      kind: 'question',
      id: 'last-listener',
      theme: 'connection',
      text: 'If you were the only person who loved a song, would that make it less beautiful?',
      choices: [
        { label: 'One listener would be enough.', next: 'private-purpose' },
        { label: 'I would be less sure of its beauty.', next: 'different-ears' },
      ],
    },
    {
      kind: 'question',
      id: 'unclaimed-art',
      theme: 'meaning',
      text: 'Would you want to know who made a painting if knowing might change how you saw it?',
      choices: [
        { label: 'The maker is part of the work.', next: 'unfinished-work' },
        { label: 'I would rather meet the painting alone.', next: 'meaning-without-words' },
      ],
    },
    {
      kind: 'question',
      id: 'private-purpose',
      theme: 'meaning',
      text: 'Could making something be worthwhile even if it never turned out as you hoped?',
      choices: [
        { label: 'The making could be enough.', next: 'unfinished-work' },
        { label: 'I would need something worth keeping.', next: 'meaning-without-words' },
      ],
    },
    {
      kind: 'question',
      id: 'different-ears',
      theme: 'reality',
      text: 'If a song sounded joyful to you and sad to everyone else, would you try to hear what they heard?',
      choices: [
        { label: 'Their hearing could change mine.', next: 'meaning-without-words' },
        { label: 'I would keep my own way of hearing it.', next: 'unfinished-work' },
      ],
    },
    {
      kind: 'question',
      id: 'unfinished-work',
      theme: 'meaning',
      text: 'If a painting changed whenever you understood it, could it ever be finished?',
      choices: [
        { label: 'Each version could be complete.', next: 'pause-song' },
        { label: 'Understanding would keep it unfinished.', next: 'pause-song' },
      ],
    },
    {
      kind: 'question',
      id: 'meaning-without-words',
      theme: 'meaning',
      text: 'If you could not explain why something mattered to you, would you trust the feeling?',
      choices: [
        { label: 'The feeling could be enough.', next: 'pause-song' },
        { label: 'I would want to understand it first.', next: 'pause-song' },
      ],
    },
    {
      kind: 'pause',
      id: 'pause-song',
      text: 'You can leave a little of it unfinished. Stay with this question, or follow another rabbit hole.',
    },
  ],
} as const satisfies ContentGraph
