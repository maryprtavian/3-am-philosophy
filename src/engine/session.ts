import type { ContentNode, NodeId } from '../content/types'
import { validateContent } from './validate-content'

export type ChoiceIndex = 0 | 1

export interface TrailStep {
  readonly nodeId: NodeId
  /** The answer on the preceding question; null at the entry point. */
  readonly via: ChoiceIndex | null
}

export interface SessionState {
  readonly trail: readonly TrailStep[]
  /** -1 is the welcome screen. Later steps may remain available for forward navigation. */
  readonly cursor: number
  /** Unique entry IDs, ordered from least to most recently started during this visit. */
  readonly visitedEntries: readonly NodeId[]
}

export type SessionAction =
  | { readonly type: 'start'; readonly sample: number }
  | { readonly type: 'answer'; readonly questionId: NodeId; readonly choice: ChoiceIndex }
  | { readonly type: 'back' }
  | { readonly type: 'forward' }
  | { readonly type: 'leave' }
  | { readonly type: 'another'; readonly sample: number }
  | { readonly type: 'reset' }

export interface EntryOptions {
  /** The UI must describe a revisit honestly when all entry points have been tried. */
  readonly kind: 'unseen' | 'revisit'
  readonly entryPoints: readonly NodeId[]
}

export function createInitialSession(): SessionState {
  return { trail: [], cursor: -1, visitedEntries: [] }
}

/** Supply one random sample in [0, 1) in the action, never inside the reducer. */
function selectEntry(options: EntryOptions, sample: number): NodeId | undefined {
  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) return undefined
  return options.entryPoints[Math.floor(sample * options.entryPoints.length)]
}

/** Validate and index once. All subsequent transitions depend only on their inputs. */
export function createSessionEngine(input: unknown) {
  const result = validateContent(input)
  if (!result.valid) {
    throw new Error(
      `Invalid philosophy content:\n${result.issues
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join('\n')}`,
    )
  }

  const graph = result.graph
  const byId = new Map(graph.nodes.map((node) => [node.id, node]))

  function getCurrentNode(state: SessionState): ContentNode | null {
    const step = state.trail[state.cursor]
    return step ? (byId.get(step.nodeId) ?? null) : null
  }

  function getEntryOptions(state: SessionState): EntryOptions {
    const unseen = graph.entryPoints.filter((id) => !state.visitedEntries.includes(id))
    if (unseen.length > 0) return { kind: 'unseen', entryPoints: unseen }

    const lastEntry = state.visitedEntries.at(-1)
    const alternatives = graph.entryPoints.filter((id) => id !== lastEntry)
    return {
      kind: 'revisit',
      entryPoints: alternatives.length > 0 ? alternatives : graph.entryPoints,
    }
  }

  function startNext(state: SessionState, sample: number): SessionState {
    const entry = selectEntry(getEntryOptions(state), sample)
    if (entry === undefined) return state

    return {
      trail: [{ nodeId: entry, via: null }],
      cursor: 0,
      visitedEntries: [...state.visitedEntries.filter((id) => id !== entry), entry],
    }
  }

  function answerQuestion(
    state: SessionState,
    action: Extract<SessionAction, { type: 'answer' }>,
  ): SessionState {
    const node = getCurrentNode(state)
    if (
      node?.kind !== 'question' ||
      node.id !== action.questionId ||
      (action.choice !== 0 && action.choice !== 1)
    ) {
      return state
    }

    // Every answer creates a new route, just as a new browser navigation discards its forward tail.
    return {
      ...state,
      trail: [
        ...state.trail.slice(0, state.cursor + 1),
        { nodeId: node.choices[action.choice].next, via: action.choice },
      ],
      cursor: state.cursor + 1,
    }
  }

  function reducer(state: SessionState, action: SessionAction): SessionState {
    switch (action.type) {
      case 'start':
        return state.cursor === -1 ? startNext(state, action.sample) : state
      case 'answer':
        return answerQuestion(state, action)
      case 'back':
        return state.cursor >= 0 ? { ...state, cursor: state.cursor - 1 } : state
      case 'forward':
        return state.cursor + 1 < state.trail.length
          ? { ...state, cursor: state.cursor + 1 }
          : state
      case 'leave':
        return state.trail.length > 0 ? { ...state, trail: [], cursor: -1 } : state
      case 'another':
        return getCurrentNode(state)?.kind === 'pause' ? startNext(state, action.sample) : state
      case 'reset':
        return createInitialSession()
    }
  }

  return { reducer, getCurrentNode, getEntryOptions }
}
