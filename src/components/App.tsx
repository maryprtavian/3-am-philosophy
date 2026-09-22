import { useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { content } from '../content/library'
import { createSessionEngine } from '../engine/session'
import { createBrowserSession } from '../engine/browser-session'
import styles from './App.module.css'

const engine = createSessionEngine(content)
const browserSession = createBrowserSession(engine)

export default function App() {
  const { session, revision, busy } = useSyncExternalStore(
    browserSession.subscribe,
    browserSession.getSnapshot,
  )
  const dispatch = browserSession.dispatch
  const node = engine.getCurrentNode(session)
  const isRevisit = engine.getEntryOptions(session).kind === 'revisit'
  const nextLabel = isRevisit ? 'Revisit a rabbit hole' : 'Another rabbit hole'
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previousRevision = useRef(revision)

  useLayoutEffect(() => {
    if (previousRevision.current === revision) return
    previousRevision.current = revision
    // Focus announces the new heading; a live region would duplicate that announcement.
    // Keep the initial page load's natural focus, and move it only after navigation.
    headingRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [revision])

  const title =
    node === null ? '3 A.M. Philosophy' : node.kind === 'question' ? node.text : 'A place to pause.'

  return (
    <main
      className={styles.page}
      data-screen={node?.kind ?? 'welcome'}
      aria-labelledby="screen-title"
      onClickCapture={(event) => {
        if (busy || event.detail > 1) {
          event.preventDefault()
          event.stopPropagation()
        }
      }}
      onKeyDownCapture={(event) => {
        if (event.repeat && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          event.stopPropagation()
        }
      }}
    >
      <div key={revision} className={styles.experience} data-entering={revision > 0}>
        {node !== null && <p className={styles.eyebrow}>3 A.M. Philosophy</p>}
        <h1
          id="screen-title"
          ref={headingRef}
          tabIndex={-1}
          className={styles.title}
          aria-describedby={node?.kind === 'question' ? undefined : 'screen-description'}
        >
          {title}
        </h1>

        {node === null ? (
          <>
            <p id="screen-description" className={styles.description}>
              A small question. A long way down.
            </p>
            {isRevisit && (
              <p className={styles.description}>
                You’ve tried every opening. There may still be other branches to explore.
              </p>
            )}
            <button
              type="button"
              aria-disabled={busy || undefined}
              className={styles.primaryButton}
              onClick={() => dispatch({ type: 'start', sample: Math.random() })}
            >
              {session.visitedEntries.length === 0 ? 'Ask me a question' : nextLabel}
            </button>
            <p className={styles.note}>No right answers. No rush.</p>
          </>
        ) : node.kind === 'question' ? (
          <div className={styles.answers} role="group" aria-label="Choose an answer">
            {([0, 1] as const).map((choice) => (
              <button
                key={`${node.id}-${choice}`}
                type="button"
                aria-disabled={busy || undefined}
                className={styles.answerButton}
                onClick={() => dispatch({ type: 'answer', questionId: node.id, choice })}
              >
                {node.choices[choice].label}
              </button>
            ))}
          </div>
        ) : (
          <>
            <p id="screen-description" className={styles.description}>
              {node.text}
            </p>
            {isRevisit && (
              <p className={styles.description}>
                You’ve tried every opening. There may still be other branches to explore.
              </p>
            )}
            <button
              type="button"
              aria-disabled={busy || undefined}
              className={styles.primaryButton}
              onClick={() => dispatch({ type: 'another', sample: Math.random() })}
            >
              {nextLabel}
            </button>
          </>
        )}

        {node !== null && (
          <nav className={styles.navigation} aria-label="Thought navigation">
            <button
              type="button"
              aria-disabled={busy || undefined}
              className={styles.quietButton}
              onClick={() => dispatch({ type: 'back' })}
            >
              Go back
            </button>
            <button
              type="button"
              aria-disabled={busy || undefined}
              className={styles.quietButton}
              onClick={() => dispatch({ type: 'leave' })}
            >
              Leave this thought
            </button>
          </nav>
        )}
      </div>
    </main>
  )
}
