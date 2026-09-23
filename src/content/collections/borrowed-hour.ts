import type { ContentGraph } from '../types.ts'

export const borrowedHourContent = {
  entryPoints: ['borrowed-hour'],
  nodes: [
    {
      kind: 'question',
      id: 'borrowed-hour',
      theme: 'time',
      text: 'Would you borrow an hour from your future to make tonight last longer?',
      choices: [
        { label: 'Tonight could be worth it.', next: 'hour-price' },
        { label: 'I would leave tomorrow intact.', next: 'waiting-room' },
      ],
    },
    {
      kind: 'question',
      id: 'hour-price',
      theme: 'time',
      text: 'Would an hour feel longer if you knew exactly what it had cost?',
      choices: [
        { label: 'I would notice every minute.', next: 'counted-minute' },
        { label: 'I would keep watching it disappear.', next: 'clockless-room' },
      ],
    },
    {
      kind: 'question',
      id: 'waiting-room',
      theme: 'time',
      text: 'If you could skip every wait in your life, would you?',
      choices: [
        { label: 'I would take the time back.', next: 'clockless-room' },
        { label: 'Something might happen while I waited.', next: 'missed-train' },
      ],
    },
    {
      kind: 'question',
      id: 'counted-minute',
      theme: 'time',
      text: 'If a clock counted only the moments you paid attention, would you want to wear it?',
      choices: [
        { label: 'It might help me notice more.', next: 'unhurried-day' },
        { label: 'It might turn noticing into a chore.', next: 'hour-ownership' },
      ],
    },
    {
      kind: 'question',
      id: 'clockless-room',
      theme: 'time',
      text: 'In a room without clocks, would you feel freer or more lost?',
      choices: [
        { label: 'Freer to follow my own pace.', next: 'unhurried-day' },
        { label: 'Lost without a shared rhythm.', next: 'hour-ownership' },
      ],
    },
    {
      kind: 'question',
      id: 'missed-train',
      theme: 'meaning',
      text: 'If missing a train led to a conversation you loved, would you still call the wait wasted?',
      choices: [
        { label: 'The surprise would give it a purpose.', next: 'hour-ownership' },
        { label: 'I could value it and still resent the delay.', next: 'unhurried-day' },
      ],
    },
    {
      kind: 'question',
      id: 'unhurried-day',
      theme: 'time',
      text: 'Would you rather have more free time, or feel less hurried in the time you have?',
      choices: [
        { label: 'More hours to myself.', next: 'pause-hour' },
        { label: 'Less hurry in the same hours.', next: 'pause-hour' },
      ],
    },
    {
      kind: 'question',
      id: 'hour-ownership',
      theme: 'time',
      text: 'Would an hour still feel like yours if someone else chose how you spent it?',
      choices: [
        { label: 'Living it would still make it mine.', next: 'pause-hour' },
        { label: 'I would need a say in how it passed.', next: 'pause-hour' },
      ],
    },
    {
      kind: 'pause',
      id: 'pause-hour',
      text: 'This minute asks nothing of you. Stay with this question, or follow another rabbit hole.',
    },
  ],
} as const satisfies ContentGraph
