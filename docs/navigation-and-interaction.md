# Navigation and interaction

Step 07, 23 September 2026.

Browser Back/Forward and the in-app back control now restore the same screens. The interface adds
a brief heading fade, guards rapid activation, and restores reading focus without changing the
one-button opening or the two-answer question layout. No dependencies were added.

## Browser history and visit memory

`src/engine/browser-session.ts` wraps the existing pure session engine. It creates a document-local
store once outside React rendering, and `App.tsx` subscribes with
[`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore). Native history
writes happen in event handling, outside reducers and effects, so development render/effect checks
do not create duplicate history entries.

- Initial loading replaces the current history entry with an opaque visit marker and numeric ID.
- Starting, answering, leaving, and entering another rabbit hole use the engine's transitions and
  push one new reference. The matching session snapshot stays in a memory map.
- Go back calls native Back. The
  [`popstate` handler](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event)
  restores the referenced snapshot without pushing another entry or replaying the answer.
- Back from a newly opened rabbit hole restores the screen that launched it, including a pause.
  Back after leaving restores the question. Forward reverses these navigations.
- Tried openings belong to the current visit and never rewind with history. Revisit wording
  therefore remains accurate when going back across different rabbit holes.
- Choosing an answer after Back replaces the abandoned forward branch in native history and prunes
  those future snapshots from the map. The pure content/branching reducer remains unchanged.

No question IDs, selected answers, or snapshots are serialized into history, URLs, localStorage,
or sessionStorage. This matters because browsers can persist the state supplied to
[`pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState). Only an opaque
reference is stored there, and it cannot restore answers without the current document's memory.

## Refresh and the boundary of the app

Refresh creates a fresh visit at the current browser-history slot. Back/Forward may still reach
references from the previous document; these are replaced with a welcome reference when visited.
They never restore old answers or change the URL.

Earlier native history entries cannot be deleted by the app, so after refresh there can be several
welcome entries to traverse. The app neither pushes nor bounces forward on stale entries. Ordinary
Back can therefore reach the document visited before the app. Browser tests cover exiting to an
earlier page and returning with Forward.

## Input, motion, and focus

Every accepted transition starts a **180 ms** input guard. Controls expose `aria-disabled` during
that period but remain in the tab order; the capture handler and store enforce the guard. Repeated
Enter/Space keydown events and later clicks in a multi-click sequence are also rejected. Native
Back/Forward remains available while the guard is active. The in-app back request has a bounded
fallback unlock if the browser declines traversal.

Only the heading fades, from 70% to full opacity over 180 ms. The question is present immediately;
there is no typing effect, positional motion, or delayed answer rendering. Reduced-motion preference
removes the animation entirely while keeping the independent input protection.

Each navigation increments a revision. React focuses the new heading once per revision and scrolls
to the top of the question, including after Back/Forward on a long page. The initial page load keeps
natural focus. Releasing the input guard does not focus or announce the heading again. Pause and
welcome descriptions remain associated with their headings; no competing live region is added.

The store subscribes to `popstate` only while the UI is subscribed. It temporarily requests manual
scroll restoration to coordinate with heading focus, restores the previous browser setting on
unsubscribe, and clears the timer and listener. New screen controls are keyed by revision to avoid
retaining the previous screen's DOM focus or event identity.

## Verification

The combined quality gate passes TypeScript, ESLint, formatting, **103 unit tests**, the production
build, and **46 browser tests**. The 18 new checks run nine scenarios in desktop/light and
mobile/dark Chromium configurations:

1. Browser and in-app Back/Forward, alternate answers, and forward-branch replacement.
2. Leaving, another-hole navigation, previous pauses, and visit-wide opening memory.
3. Refresh, stale Back/Forward references, and exiting to the preceding document.
4. Opaque history references, unchanged URLs, and empty local/session storage.
5. Rapid activation, direct emulated touch taps, double-clicks, and native navigation during a guard.
6. Held Enter and Space keys.
7. Focus and scroll restoration around long content at 320 pixels.
8. Exactly one heading-focus event per navigation with the normal fade.
9. The same focus behavior with reduced motion and no animation.

The existing eight journey and 20 layout checks also pass. The in-app preview was manually checked
for Back/Forward, focused question restoration, and refresh to a fresh welcome; its captured console
contained no errors or warnings. Production assets measure **74.20 kB gzip** of JavaScript and
**1.75 kB gzip** of CSS.

These checks verify focus events, not spoken screen-reader announcements. Physical touch devices,
real screen-reader output, Firefox, WebKit, and browser zoom remain Step 10 verification. Step 08
reviews the experience before expanding the content.
