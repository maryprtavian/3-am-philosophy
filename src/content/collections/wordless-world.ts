import type { ContentGraph } from '../types.ts'

export const wordlessWorldContent = {
  entryPoints: ['wordless-world'],
  nodes: [
    {
      kind: 'question',
      id: 'wordless-world',
      theme: 'connection',
      text: 'If everyone understood your words but nobody could hear your tone, would you feel understood?',
      choices: [
        { label: 'The words could carry enough.', next: 'literal-world' },
        { label: 'Something important would be missing.', next: 'borrowed-feeling' },
      ],
    },
    {
      kind: 'question',
      id: 'literal-world',
      theme: 'connection',
      text: 'If every sentence were understood exactly as written, would you speak more freely or more carefully?',
      choices: [
        { label: 'More freely, with fewer misunderstandings.', next: 'perfect-translation' },
        { label: 'More carefully, without room for hints.', next: 'useful-silence' },
      ],
    },
    {
      kind: 'question',
      id: 'borrowed-feeling',
      theme: 'connection',
      text: 'Would you lend someone a feeling for a minute if you could not choose what they made of it?',
      choices: [
        { label: 'I would let them feel it.', next: 'useful-silence' },
        { label: 'I would rather describe it myself.', next: 'untranslatable-word' },
      ],
    },
    {
      kind: 'question',
      id: 'perfect-translation',
      theme: 'identity',
      text: 'If a translator found the perfect words for you, would the message still feel like yours?',
      choices: [
        { label: 'It would express what I meant.', next: 'being-known' },
        { label: 'Some of me lives in how I say it.', next: 'unanswered-message' },
      ],
    },
    {
      kind: 'question',
      id: 'useful-silence',
      theme: 'connection',
      text: 'Can a shared silence say something that neither person could put into words?',
      choices: [
        { label: 'Some things can be shared that way.', next: 'unanswered-message' },
        { label: 'I would still want someone to say it.', next: 'being-known' },
      ],
    },
    {
      kind: 'question',
      id: 'untranslatable-word',
      theme: 'connection',
      text: 'Would inventing a word for a private feeling make it easier to share?',
      choices: [
        { label: 'A name could give us somewhere to start.', next: 'being-known' },
        { label: 'The word might hide how different it feels.', next: 'unanswered-message' },
      ],
    },
    {
      kind: 'question',
      id: 'being-known',
      theme: 'connection',
      text: 'Would you rather be understood perfectly once, or imperfectly for a lifetime?',
      choices: [
        { label: 'One moment of perfect understanding.', next: 'pause-words' },
        { label: 'A lifetime of trying together.', next: 'pause-words' },
      ],
    },
    {
      kind: 'question',
      id: 'unanswered-message',
      theme: 'connection',
      text: 'Would a letter still connect two people if only its writer ever read it?',
      choices: [
        { label: 'The act of writing could connect them.', next: 'pause-words' },
        { label: 'It would need to reach the other person.', next: 'pause-words' },
      ],
    },
    {
      kind: 'pause',
      id: 'pause-words',
      text: 'There is room for a little silence here. Keep this question company, or follow another rabbit hole.',
    },
  ],
} as const satisfies ContentGraph
