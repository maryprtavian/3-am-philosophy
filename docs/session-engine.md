# Session engine

Step 04 implements the session independently of React in `src/engine/session.ts`. The engine uses
the validated content graph; it does not store text, scores, or user profiles in session state.

## Creating and reading a session

```ts
import { content } from '../content/library'
import { createInitialSession, createSessionEngine } from '../engine/session'

// Create once for a content collection, outside component rendering.
const engine = createSessionEngine(content)
const initial = createInitialSession()
const started = engine.reducer(initial, { type: 'start', sample: 0.2 })

engine.getCurrentNode(started) // A question, a pause, or null for welcome.
engine.getEntryOptions(started) // { kind: 'unseen' | 'revisit', entryPoints: [...] }
```

Creation validates and indexes the graph once. Invalid content throws an error containing the
validator's field paths and messages. The existing combined-library test catches content mistakes
before the app is built.

In the UI, generate a sample with `Math.random()` in the start/another event handler and pass it in
the action. Never generate randomness inside the reducer or a render. Replaying the same state and
action produces the same result, including React's development checks that may call a reducer twice.
No additional randomness occurs when answering questions.

## State

- `trail` holds node IDs and the selected answer used to arrive at each node. The entry has
  `via: null`; subsequent steps use `via: 0` or `via: 1`. This preserves the selected answer even
  when both choices lead to the same pause.
- `cursor` is the current position in the trail. `-1` means welcome. Steps beyond the cursor are
  forward history, not the active route; use `trail.slice(0, cursor + 1)` for the active route.
- `visitedEntries` contains unique opening IDs, ordered by their most recent start during this
  visit. Backtracking does not erase these IDs.

State and content are readonly. Transitions return new state without changing their inputs. Keep
state in memory; creating an initial session on a fresh page load starts a new visit. Arbitrary
external or serialized state is not an accepted input contract. Browser-history restoration and
stale-entry handling will be integrated in Step 07.

## Actions and boundaries

| Action                                  | When available                                        | Behavior                                                               |
| --------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| `start` with `sample`                   | Welcome                                               | Select an opening and replace the current trail.                       |
| `answer` with `questionId` and `choice` | The matching current question                         | Follow its explicit answer link and discard any forward history.       |
| `back`                                  | A question or pause                                   | Move back one position; moving back from the opening shows welcome.    |
| `forward`                               | A later trail step exists                             | Restore that step without choosing or recording a new answer.          |
| `leave`                                 | A trail exists, including at welcome after going back | Clear the route and show welcome; retain visited openings.             |
| `another` with `sample`                 | A pause                                               | Select another opening and replace the route; retain visited openings. |
| `reset`                                 | Any state                                             | Clear the entire visit, including visited openings.                    |

An answer always creates a new forward route, even if it repeats an earlier answer. Only `forward`
restores the existing route. Leaving or selecting another opening removes the previous route from
the engine; this trail is for navigation within one rabbit hole. The later browser integration may
manage a history of session snapshots across these actions.

Unavailable actions return the same state object. Invalid random samples (outside `[0, 1)` or not
finite), invalid answer indices, and answers referring to another question are also ignored. The
question ID guard rejects a repeated event from the previous question. Full rapid-input handling,
focus changes, and browser navigation remain Step 07.

## Entry selection and exhaustion

Unvisited openings are always preferred. The supplied sample chooses uniformly from the eligible
list when the caller supplies uniform random samples.

When every opening has been started, `getEntryOptions` returns `kind: 'revisit'`. The UI should then
offer a revisit explicitly, rather than imply new content. An opening counts as visited as soon as
it is started, even if the person leaves early; this does not mean every branch has been explored.

Revisits exclude the most recently started opening when there is an alternative. A collection with
one opening can still replay it. Starting another hole clears its trail but keeps the visit's
opening history. Only `reset` or a fresh page load clears that history.

## Verification

The 38 engine tests cover actions and their boundaries, both answer choices, back/forward,
replacement of forward history, shared pauses, leaving, resetting, deterministic entry selection,
finite-content reporting, input preservation, and invalid content/actions. Integration cases walk
all 26 complete answer sequences in the authored starter library through the reducer, checking
back/forward at every edge and selecting another opening at every pause.

Run `npm test` for behavior checks or `npm run check` for the complete quality gate. Rendering and
browser interaction are introduced in the following steps.
