import { createInitialSession } from './session'
import type { createSessionEngine, SessionAction, SessionState } from './session'

type Engine = ReturnType<typeof createSessionEngine>
type BrowserAction = Exclude<SessionAction, { type: 'forward' | 'reset' }>

interface HistoryEntry {
  readonly session: SessionState
  readonly parent: number | null
}

export interface BrowserSnapshot {
  readonly session: SessionState
  readonly revision: number
  readonly busy: boolean
}

// Keep the short input guard even when reduced motion removes the visual transition.
const INPUT_GUARD_MS = 180

/** A document-local store. Only opaque references are written to browser history. */
export function createBrowserSession(engine: Engine, browser: Window = window) {
  const visit = browser.crypto.randomUUID()
  const entries = new Map<number, HistoryEntry>()
  const listeners = new Set<() => void>()
  let serial = 0
  let current = 0
  let timer: number | undefined
  let previousScrollRestoration: ScrollRestoration = 'auto'
  let snapshot: BrowserSnapshot = { session: createInitialSession(), revision: 0, busy: false }

  function marker(id: number) {
    return { philosophy: { version: 1, visit, id } }
  }

  function readId(state: unknown): number | undefined {
    if (typeof state !== 'object' || state === null || !('philosophy' in state)) return undefined
    const value: unknown = state.philosophy
    if (
      typeof value !== 'object' ||
      value === null ||
      !('version' in value) ||
      value.version !== 1 ||
      !('visit' in value) ||
      value.visit !== visit ||
      !('id' in value) ||
      typeof value.id !== 'number' ||
      !Number.isSafeInteger(value.id)
    )
      return undefined
    return entries.has(value.id) ? value.id : undefined
  }

  function emit() {
    for (const listener of listeners) listener()
  }

  function unlockAfter(delay: number) {
    browser.clearTimeout(timer)
    timer = browser.setTimeout(() => {
      snapshot = { ...snapshot, busy: false }
      emit()
    }, delay)
  }

  function show(session: SessionState) {
    snapshot = { session, revision: snapshot.revision + 1, busy: true }
    unlockAfter(INPUT_GUARD_MS)
    emit()
  }

  function onPopState(event: PopStateEvent) {
    const id = readId(event.state)
    const entry = id === undefined ? undefined : entries.get(id)
    if (id !== undefined && entry) {
      current = id
      // Visiting an earlier screen does not make an already-tried opening unseen again.
      show({ ...entry.session, visitedEntries: snapshot.session.visitedEntries })
      return
    }

    // A reload invalidates the previous document's references. Adopt a welcome at this slot,
    // without pushing or bouncing forward, so ordinary Back can still leave the site.
    const welcome = engine.reducer(snapshot.session, { type: 'leave' })
    current = ++serial
    entries.set(current, { session: welcome, parent: null })
    browser.history.replaceState(marker(current), '')
    show(welcome)
  }

  entries.set(current, { session: snapshot.session, parent: null })
  browser.history.replaceState(marker(current), '')

  function dispatch(action: BrowserAction) {
    if (snapshot.busy) return

    if (action.type === 'back') {
      if (snapshot.session.cursor < 0) return
      // Every playable screen has a preceding app entry; use the same popstate path as Back.
      snapshot = { ...snapshot, busy: true }
      emit()
      browser.history.back()
      // Avoid a permanent lock if the browser declines a traversal. A popstate replaces this timer.
      unlockAfter(1000)
      return
    }
    const next = engine.reducer(snapshot.session, action)
    if (next === snapshot.session) return
    const nextId = serial + 1
    // Do the native write first: an unsuccessful write must not advance the in-memory route.
    browser.history.pushState(marker(nextId), '')

    // Keep the current ancestry and drop abandoned forward snapshots, matching pushState.
    const ancestors = new Set<number>()
    let ancestor: number | null = current
    while (ancestor !== null) {
      ancestors.add(ancestor)
      ancestor = entries.get(ancestor)?.parent ?? null
    }
    for (const id of entries.keys()) if (!ancestors.has(id)) entries.delete(id)
    entries.set(nextId, { session: next, parent: current })
    current = nextId
    serial = nextId
    show(next)
  }

  function subscribe(listener: () => void) {
    if (listeners.size === 0) {
      previousScrollRestoration = browser.history.scrollRestoration
      browser.history.scrollRestoration = 'manual'
      browser.addEventListener('popstate', onPopState)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) {
        browser.removeEventListener('popstate', onPopState)
        browser.history.scrollRestoration = previousScrollRestoration
        browser.clearTimeout(timer)
        if (snapshot.busy) snapshot = { ...snapshot, busy: false }
      }
    }
  }

  return { subscribe, getSnapshot: () => snapshot, dispatch }
}
