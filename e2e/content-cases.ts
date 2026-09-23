/** Authored smoke routes, independent of the graph traversal code under test. */
export const expandedJourneys = [
  {
    entry: 'perfect-dream',
    opening: 'Would you stay in a perfect dream if waking meant an ordinary life?',
    answers: [
      'I would choose to wake up.',
      'Something I could not control.',
      'Pain would not prove anything.',
      'I would keep looking for firmer ground.',
    ],
    lastQuestion:
      'If every test left room for doubt, would you keep testing whether you were dreaming?',
  },
  {
    entry: 'borrowed-hour',
    opening: 'Would you borrow an hour from your future to make tonight last longer?',
    answers: [
      'Tonight could be worth it.',
      'I would notice every minute.',
      'It might help me notice more.',
      'Less hurry in the same hours.',
    ],
    lastQuestion:
      'Would you rather have more free time, or feel less hurried in the time you have?',
  },
  {
    entry: 'unheard-song',
    opening: 'If a song were never heard, could it still be beautiful?',
    answers: [
      'Beauty would be there anyway.',
      'The intention would matter.',
      'The making could be enough.',
      'Understanding would keep it unfinished.',
    ],
    lastQuestion: 'If a painting changed whenever you understood it, could it ever be finished?',
  },
  {
    entry: 'wordless-world',
    opening:
      'If everyone understood your words but nobody could hear your tone, would you feel understood?',
    answers: [
      'Something important would be missing.',
      'I would rather describe it myself.',
      'A name could give us somewhere to start.',
      'A lifetime of trying together.',
    ],
    lastQuestion: 'Would you rather be understood perfectly once, or imperfectly for a lifetime?',
  },
] as const
