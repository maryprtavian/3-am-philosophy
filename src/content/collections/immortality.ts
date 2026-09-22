import type { ContentGraph } from '../types'

export const immortalityContent = {
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
        { label: 'Because it ends.', next: 'last-evening' },
        { label: 'Because I was there.', next: 'unwitnessed-day' },
      ],
    },
    {
      kind: 'question',
      id: 'another-century',
      theme: 'identity',
      text: 'If you had to forget a century to live another, would you still choose forever?',
      choices: [
        { label: 'I could become someone new.', next: 'borrowed-memories' },
        { label: 'I would lose too much of myself.', next: 'keeping-memories' },
      ],
    },
    {
      kind: 'question',
      id: 'last-evening',
      theme: 'time',
      text: 'If an evening mattered because it was your last, would knowing that make it better or harder to enjoy?',
      choices: [
        { label: 'I would notice everything more.', next: 'ordinary-tuesday' },
        { label: 'The ending would crowd everything out.', next: 'chosen-ending' },
      ],
    },
    {
      kind: 'question',
      id: 'unwitnessed-day',
      theme: 'connection',
      text: 'Would a perfect day still feel complete if nobody could ever know you had lived it?',
      choices: [
        { label: 'My own experience would be enough.', next: 'forgotten-kindness' },
        { label: 'I would want someone to share it with.', next: 'shared-witness' },
      ],
    },
    {
      kind: 'question',
      id: 'borrowed-memories',
      theme: 'identity',
      text: "If you woke with someone else's memories, which life would feel more like yours?",
      choices: [
        { label: 'The life I remembered.', next: 'stranger-promise' },
        { label: 'The life this body had actually lived.', next: 'memory-price' },
      ],
    },
    {
      kind: 'question',
      id: 'keeping-memories',
      theme: 'identity',
      text: 'If you could keep living only by letting some memories disappear, would you protect the happiest ones or the ones that explain how you became who you are?',
      choices: [
        {
          label: 'The happiest ones, even if parts of my story stopped making sense.',
          next: 'memory-price',
        },
        {
          label: 'The ones that explain me, even when I would rather forget them.',
          next: 'stranger-promise',
        },
      ],
    },
    {
      kind: 'question',
      id: 'ordinary-tuesday',
      theme: 'meaning',
      text: 'Would you choose a thousand ordinary Tuesdays over one extraordinary night?',
      choices: [
        { label: 'Give me the Tuesdays.', next: 'worth-repeating' },
        { label: 'I would choose the extraordinary night.', next: 'pause-time' },
      ],
    },
    {
      kind: 'question',
      id: 'chosen-ending',
      theme: 'time',
      text: 'If you could live forever but choose when to stop, would forever feel different?',
      choices: [
        { label: 'The choice would make it feel different.', next: 'worth-repeating' },
        { label: 'Endless time would still trouble me.', next: 'pause-time' },
      ],
    },
    {
      kind: 'question',
      id: 'forgotten-kindness',
      theme: 'connection',
      text: "If a kindness changed someone's life but neither of you remembered it, would it still matter?",
      choices: [
        { label: 'The change would be enough.', next: 'pause-connection' },
        { label: 'Something would be lost without the memory.', next: 'pause-connection' },
      ],
    },
    {
      kind: 'question',
      id: 'shared-witness',
      theme: 'connection',
      text: 'If someone remembered your perfect day differently, would that change what the day meant to you?',
      choices: [
        { label: 'Their memory would become part of mine.', next: 'pause-connection' },
        { label: 'My experience would keep its own meaning.', next: 'pause-connection' },
      ],
    },
    {
      kind: 'question',
      id: 'stranger-promise',
      theme: 'identity',
      text: 'Would you keep a promise made by a version of you whose memories you no longer had?',
      choices: [
        { label: 'It would still be my promise.', next: 'pause-self' },
        { label: 'They could not promise for who I am now.', next: 'pause-self' },
      ],
    },
    {
      kind: 'question',
      id: 'memory-price',
      theme: 'identity',
      text: 'Would you erase a painful memory if doing so also changed what mattered to you?',
      choices: [
        { label: 'I would welcome a different version of myself.', next: 'pause-self' },
        { label: 'I would want to keep the person I recognize.', next: 'pause-self' },
      ],
    },
    {
      kind: 'question',
      id: 'worth-repeating',
      theme: 'time',
      text: 'If one ordinary day could repeat forever, would you want to know it was repeating?',
      choices: [
        { label: 'Knowing would make each return feel different.', next: 'pause-time' },
        { label: 'I would rather meet it as if it were new.', next: 'pause-time' },
      ],
    },
    {
      kind: 'pause',
      id: 'pause-time',
      text: 'Forever can wait a moment. Stay with this thought, or follow another rabbit hole.',
    },
    {
      kind: 'pause',
      id: 'pause-connection',
      text: 'You do not have to settle what makes a moment matter. Stay here, or follow another rabbit hole.',
    },
    {
      kind: 'pause',
      id: 'pause-self',
      text: 'The question can stay open. Sit with it a little longer, or follow another rabbit hole.',
    },
  ],
} as const satisfies ContentGraph
