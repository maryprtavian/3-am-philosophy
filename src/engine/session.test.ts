import { describe, expect, it } from 'vitest'
import { exampleContent } from '../content/example'
import { content } from '../content/library'
import type { ContentGraph, ContentNode, NodeId } from '../content/types'
import { createInitialSession, createSessionEngine } from './session'
import type { ChoiceIndex, SessionAction, SessionState } from './session'

type Engine = ReturnType<typeof createSessionEngine>

const engine = createSessionEngine(exampleContent)

const threeEntries = {
  entryPoints: ['immortality', 'second-entry', 'third-entry'],
  nodes: [
    ...exampleContent.nodes,
    { ...exampleContent.nodes[0], id: 'second-entry' },
    { ...exampleContent.nodes[0], id: 'third-entry' },
  ],
} satisfies ContentGraph

function start(target: Engine = engine, sample = 0): SessionState {
  return target.reducer(createInitialSession(), { type: 'start', sample })
}

function answer(target: Engine, state: SessionState, choice: ChoiceIndex): SessionState {
  const node = target.getCurrentNode(state)
  if (node?.kind !== 'question') throw new Error('Expected a question before answering.')
  return target.reducer(state, { type: 'answer', questionId: node.id, choice })
}

function finishExample(target: Engine = engine, state = start(target)): SessionState {
  return answer(target, answer(target, state, 0), 1)
}

function freezeDeep(value: unknown): void {
  if (typeof value !== 'object' || value === null) return
  for (const child of Object.values(value as Record<string, unknown>)) freezeDeep(child)
  Object.freeze(value)
}

describe('session transitions', () => {
  it('begins at the welcome screen with a fresh visit', () => {
    const state = createInitialSession()
    expect(engine.getCurrentNode(state)).toBeNull()
    expect(state.trail).toEqual([])
    expect(state.visitedEntries).toEqual([])
    expect(state.cursor).toBe(-1)
    expect(createInitialSession()).not.toBe(state)
  })

  it('starts at an entry point and records it as visited', () => {
    const state = start()
    expect(engine.getCurrentNode(state)?.id).toBe('immortality')
    expect(state.visitedEntries).toEqual(['immortality'])
    expect(state.trail).toEqual([{ nodeId: 'immortality', via: null }])
  })

  it.each([
    { choice: 0, expected: 'fleeting-moments' },
    { choice: 1, expected: 'another-century' },
  ] as const)('follows answer $choice to $expected', ({ choice, expected }) => {
    const state = answer(engine, start(), choice)
    expect(engine.getCurrentNode(state)?.id).toBe(expected)
    expect(state.trail.at(-1)).toEqual({ nodeId: expected, via: choice })
    expect(state.visitedEntries).toEqual(['immortality'])
  })

  it('stops at a pause and can return to the preceding question', () => {
    const pause = finishExample()
    expect(engine.getCurrentNode(pause)?.kind).toBe('pause')
    const previous = engine.reducer(pause, { type: 'back' })
    expect(engine.getCurrentNode(previous)?.id).toBe('fleeting-moments')
    expect(engine.reducer(previous, { type: 'forward' })).toEqual(pause)
  })

  it('can go back through the entry to welcome, then restore the route forward', () => {
    const pause = finishExample()
    let state = pause
    const expectedBack = ['fleeting-moments', 'immortality', undefined]
    for (const id of expectedBack) {
      state = engine.reducer(state, { type: 'back' })
      expect(engine.getCurrentNode(state)?.id).toBe(id)
    }
    expect(engine.reducer(state, { type: 'back' })).toBe(state)
    expect(state.visitedEntries).toEqual(['immortality'])
    for (const id of ['immortality', 'fleeting-moments', 'open-question']) {
      state = engine.reducer(state, { type: 'forward' })
      expect(engine.getCurrentNode(state)?.id).toBe(id)
    }
    expect(state).toEqual(pause)
    expect(engine.reducer(state, { type: 'forward' })).toBe(state)
  })

  it('discards the abandoned forward route when an earlier answer changes', () => {
    const pause = finishExample()
    const root = engine.reducer(engine.reducer(pause, { type: 'back' }), { type: 'back' })
    const alternate = answer(engine, root, 1)
    expect(alternate.trail.map((step) => step.nodeId)).toEqual(['immortality', 'another-century'])
    expect(engine.reducer(alternate, { type: 'forward' })).toBe(alternate)
    expect(engine.getCurrentNode(answer(engine, alternate, 0))?.kind).toBe('pause')
    expect(pause.trail.map((step) => step.nodeId)).toEqual([
      'immortality',
      'fleeting-moments',
      'open-question',
    ])
  })

  it('also discards forward history when the same answer is chosen again', () => {
    const pause = finishExample()
    const root = engine.reducer(engine.reducer(pause, { type: 'back' }), { type: 'back' })
    const repeated = answer(engine, root, 0)
    expect(engine.getCurrentNode(repeated)?.id).toBe('fleeting-moments')
    expect(repeated.trail).toHaveLength(2)
    expect(engine.reducer(repeated, { type: 'forward' })).toBe(repeated)
  })

  it('retains which answer was chosen even when both answers lead to the same pause', () => {
    const pause = finishExample()
    const previous = engine.reducer(pause, { type: 'back' })
    const changed = answer(engine, previous, 0)
    expect(engine.getCurrentNode(changed)).toEqual(engine.getCurrentNode(pause))
    expect(pause.trail.at(-1)?.via).toBe(1)
    expect(changed.trail.at(-1)?.via).toBe(0)
  })

  it.each(['question', 'pause', 'welcome-with-forward-history'])(
    'leaves from %s and clears the route',
    (position) => {
      let state = position === 'pause' ? finishExample() : start()
      if (position === 'welcome-with-forward-history')
        state = engine.reducer(state, { type: 'back' })
      const left = engine.reducer(state, { type: 'leave' })
      expect(engine.getCurrentNode(left)).toBeNull()
      expect(left.trail).toEqual([])
      expect(left.visitedEntries).toEqual(['immortality'])
      expect(engine.reducer(left, { type: 'forward' })).toBe(left)
      expect(engine.reducer(left, { type: 'leave' })).toBe(left)
    },
  )

  it('resets the entire visit, including the remembered entry points', () => {
    const state = engine.reducer(finishExample(), { type: 'reset' })
    expect(state).toEqual(createInitialSession())
    expect(engine.getEntryOptions(state).kind).toBe('unseen')
    expect(engine.reducer(state, { type: 'forward' })).toBe(state)
  })

  it('is deterministic and never mutates content, state, or actions', () => {
    const source = structuredClone(exampleContent)
    freezeDeep(source)
    const target = createSessionEngine(source)
    let state = createInitialSession()
    const actions: SessionAction[] = [
      { type: 'start', sample: 0 },
      { type: 'answer', questionId: 'immortality', choice: 0 },
      { type: 'back' },
      { type: 'forward' },
      { type: 'answer', questionId: 'fleeting-moments', choice: 1 },
      { type: 'another', sample: 0.5 },
      { type: 'leave' },
      { type: 'reset' },
    ]
    for (const action of actions) {
      const before = structuredClone(state)
      freezeDeep(state)
      freezeDeep(action)
      const next = target.reducer(state, action)
      expect(target.reducer(state, action)).toEqual(next)
      expect(state).toEqual(before)
      state = next
    }
    expect(source).toEqual(exampleContent)
  })
})

describe('entry selection and finite content', () => {
  const target = createSessionEngine(threeEntries)

  it.each([
    { sample: 0, expected: 'immortality' },
    { sample: 1 / 3, expected: 'second-entry' },
    { sample: 2 / 3, expected: 'third-entry' },
    { sample: 1 - Number.EPSILON, expected: 'third-entry' },
  ])('selects $expected for controlled sample $sample', ({ sample, expected }) => {
    expect(target.getCurrentNode(start(target, sample))?.id).toBe(expected)
  })

  it('selects randomly within the unseen entries before offering revisits', () => {
    const first = finishExample(target)
    expect(target.getEntryOptions(first)).toEqual({
      kind: 'unseen',
      entryPoints: ['second-entry', 'third-entry'],
    })
    const second = target.reducer(first, { type: 'another', sample: 0.75 })
    expect(target.getCurrentNode(second)?.id).toBe('third-entry')
    expect(second.trail).toHaveLength(1)
    expect(target.getEntryOptions(second)).toEqual({
      kind: 'unseen',
      entryPoints: ['second-entry'],
    })
    const third = target.reducer(finishExample(target, second), { type: 'another', sample: 0 })
    expect(third.visitedEntries).toEqual(['immortality', 'third-entry', 'second-entry'])
    expect(target.getEntryOptions(third)).toEqual({
      kind: 'revisit',
      entryPoints: ['immortality', 'third-entry'],
    })
  })

  it('avoids the most recently started entry after exhaustion and keeps entries unique', () => {
    let state = start(target)
    for (const id of ['second-entry', 'third-entry', 'immortality', 'second-entry']) {
      state = target.reducer(finishExample(target, state), { type: 'another', sample: 0 })
      expect(target.getCurrentNode(state)?.id).toBe(id)
    }
    expect(state.visitedEntries).toEqual(['third-entry', 'immortality', 'second-entry'])
    expect(target.getEntryOptions(state)).toEqual({
      kind: 'revisit',
      entryPoints: ['immortality', 'third-entry'],
    })
  })

  it('allows an honest replay when there is only one entry', () => {
    const pause = finishExample()
    expect(engine.getEntryOptions(pause)).toEqual({ kind: 'revisit', entryPoints: ['immortality'] })
    const replay = engine.reducer(pause, { type: 'another', sample: 0.8 })
    expect(engine.getCurrentNode(replay)?.id).toBe('immortality')
    expect(replay.trail).toHaveLength(1)
    expect(replay.visitedEntries).toEqual(['immortality'])
  })

  it.each(['leave', 'back'] as const)(
    'remembers entries after %s and starts a fresh route',
    (type) => {
      const welcome = target.reducer(start(target), { type })
      const restarted = target.reducer(welcome, { type: 'start', sample: 0 })
      expect(target.getCurrentNode(restarted)?.id).toBe('second-entry')
      expect(restarted.trail).toEqual([{ nodeId: 'second-entry', via: null }])
      expect(restarted.visitedEntries).toEqual(['immortality', 'second-entry'])
      expect(target.reducer(restarted, { type: 'forward' })).toBe(restarted)
    },
  )
})

describe('invalid actions and content', () => {
  it('rejects malformed content at engine creation with a useful field path', () => {
    expect(() =>
      createSessionEngine({ ...exampleContent, entryPoints: ['missing-entry'] }),
    ).toThrow('entryPoints[0]')
  })

  it('ignores actions unavailable on the welcome screen', () => {
    const state = createInitialSession()
    const actions: SessionAction[] = [
      { type: 'answer', questionId: 'immortality', choice: 0 },
      { type: 'another', sample: 0 },
      { type: 'back' },
      { type: 'forward' },
      { type: 'leave' },
    ]
    for (const action of actions) expect(engine.reducer(state, action)).toBe(state)
  })

  it('ignores actions unavailable while answering a question', () => {
    const state = start()
    const actions: SessionAction[] = [
      { type: 'start', sample: 0 },
      { type: 'another', sample: 0 },
      { type: 'forward' },
      { type: 'answer', questionId: 'missing-question', choice: 0 },
    ]
    for (const action of actions) expect(engine.reducer(state, action)).toBe(state)
  })

  it('ignores answers and the welcome action at a pause', () => {
    const pause = finishExample()
    const actions: SessionAction[] = [
      { type: 'answer', questionId: 'open-question', choice: 0 },
      { type: 'answer', questionId: 'fleeting-moments', choice: 1 },
      { type: 'start', sample: 0 },
    ]
    for (const action of actions) expect(engine.reducer(pause, action)).toBe(pause)
  })

  it('ignores a duplicate answer event from the previous question', () => {
    const action: SessionAction = { type: 'answer', questionId: 'immortality', choice: 0 }
    const state = engine.reducer(start(), action)
    expect(engine.reducer(state, action)).toBe(state)
  })

  it.each([-1, 2, NaN])('ignores out-of-contract answer index %s at runtime', (choice) => {
    const state = start()
    expect(
      engine.reducer(state, {
        type: 'answer',
        questionId: 'immortality',
        choice: choice as ChoiceIndex,
      }),
    ).toBe(state)
  })

  it.each([-0.1, 1, NaN, Infinity, -Infinity])('ignores invalid random sample %s', (sample) => {
    const welcome = createInitialSession()
    const pause = finishExample()
    expect(engine.reducer(welcome, { type: 'start', sample })).toBe(welcome)
    expect(engine.reducer(pause, { type: 'another', sample })).toBe(pause)
  })
})

describe('complete starter-library journeys', () => {
  const target = createSessionEngine(content)
  const byId = new Map<NodeId, ContentNode>(content.nodes.map((node) => [node.id, node]))

  it.each([
    { sample: 0, entry: 'immortality', expectedRoutes: 18 },
    { sample: 0.5, entry: 'perfect-copy', expectedRoutes: 8 },
  ])(
    'traverses every answer sequence from $entry through the reducer',
    ({ sample, entry, expectedRoutes }) => {
      const opening = start(target, sample)
      expect(target.getCurrentNode(opening)?.id).toBe(entry)
      let completed = 0

      function walk(state: SessionState): void {
        const node = target.getCurrentNode(state)
        if (!node) throw new Error('A journey unexpectedly returned to welcome.')
        expect(state.trail.length).toBeLessThanOrEqual(content.nodes.length)
        expect(new Set(state.trail.map((step) => step.nodeId)).size).toBe(state.trail.length)
        if (node.kind === 'pause') {
          completed += 1
          const next = target.reducer(state, { type: 'another', sample: 0 })
          expect(target.getCurrentNode(next)?.id).toBe(
            entry === 'immortality' ? 'perfect-copy' : 'immortality',
          )
          expect(next.trail).toHaveLength(1)
          expect(target.getEntryOptions(next).kind).toBe('revisit')
          return
        }

        const authored = byId.get(node.id)
        if (authored?.kind !== 'question') throw new Error('Missing authored question.')
        for (const choice of [0, 1] as const) {
          const next = answer(target, state, choice)
          expect(target.getCurrentNode(next)?.id).toBe(authored.choices[choice].next)
          const back = target.reducer(next, { type: 'back' })
          expect(target.getCurrentNode(back)?.id).toBe(node.id)
          expect(target.reducer(back, { type: 'forward' })).toEqual(next)
          walk(next)
        }
      }

      walk(opening)
      expect(completed).toBe(expectedRoutes)
    },
  )
})
