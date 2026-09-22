# First playable version

Step 05, 23 September 2026.

These notes record the first playable milestone. Step 06 refined its layout and Step 07 added
browser history and interaction details. See [responsive design](./responsive-design.md) and
[navigation behavior](./navigation-and-interaction.md) for the current implementation.
Step 08 then reviewed the experience and kept the final question visible at pauses; see the
[experience review](./experience-review.md).

The UI in `src/components/App.tsx` now uses the authored library and the existing pure session
engine. The small interface stays in one component, with styling in its CSS Module. Content and
traversal remain separate; no application dependency was added.

## Experience

- Welcome has one interactive control: **Ask me a question**. Returning to welcome still shows
  exactly one button, with wording reflecting whether another opening or a revisit is available.
- Questions render the authored text in a heading and two equally styled native answer buttons.
  Each button dispatches the current question ID and its answer index to the reducer.
- **Go back** restores the preceding question, including from a pause. Back from the opening
  returns to welcome. **Leave this thought** clears the route while retaining tried openings.
- Pauses show the authored reflection and an **Another rabbit hole** button. Once both openings
  have been tried, the button reads **Revisit a rabbit hole**, with an explanation that other
  branches may remain. This reports tried openings, not completed questions or scores.
- State exists only in React memory. Reloading starts a fresh visit. Answers do not appear in URLs.

The engine is created once at module scope, and React's
[`useReducer`](https://react.dev/reference/react/useReducer) owns the session. Start/another event
handlers provide the random sample; rendering and reducer execution do not generate randomness.
All authored content is interpolated as text, without raw HTML rendering.

## Initial keyboard and reading behavior

The current screen has one `h1` with `tabIndex={-1}`. It is programmatically focusable but does not
add a tab stop to the single-button welcome screen. Initial page load keeps natural browser focus.
After navigation, an effect focuses the updated heading. A screen ID guard avoids repeating this
effect for the same screen in React development checks.

Question changes use heading focus as their announcement mechanism. There is no competing live
region. Welcome and pause headings reference their explanatory paragraph with `aria-describedby`.
From the focused question, Tab reaches the first answer, the second answer, then back and leave.
Controls follow reading order in the DOM, consistent with the
[W3C focus-order technique](https://www.w3.org/WAI/WCAG22/Techniques/general/G59.html).

Native buttons support Enter and Space. The shared `:focus-visible` rule gives focused elements a
three-pixel outline. Answer buttons are keyed by question and choice, and the reducer rejects an
answer event carrying an old question ID. Complete rapid-input/transition handling remains Step 07.

Automated tests verify focus and accessible descriptions. Actual spoken announcements have not
been checked with a screen reader; those checks remain in the accessibility review.

## Initial styling

The implementation supplies a readable centered layout, serif headings, equal full-width answers,
and system-based light/dark colors. Controls wrap long labels, and the page can scroll naturally.
No transitions or sound are included at this step.

The in-app preview was visually inspected at desktop width and at 390 CSS pixels with the longest
starter question and answer labels. At that mobile width, document width remained 390 pixels and
both long-answer targets were about 342 × 82 CSS pixels. This is an initial check; the complete
responsive matrix, desktop answer arrangement, safe areas, and visual refinement remain Step 06.

## Browser tests

Playwright Test **1.63.0** is pinned as a development dependency. The test source is
`e2e/journey.spec.ts`, with strict TypeScript checking through `tsconfig.e2e.json` and the existing
typed ESLint rules.

Four scenarios run in two Chromium configurations: desktop at 1440 × 900 with light appearance,
and mobile emulation at 390 × 844 with dark appearance and touch capability. This produces eight
browser tests:

1. Complete both rabbit holes, reach their pauses, see exhaustion wording, revisit, and leave.
2. Go back and change an answer, display long content, leave, start an unseen opening, and refresh.
3. Complete a keyboard journey using Tab, Enter, and Space; check focus outlines, order, and the
   pause's accessible description.
4. Start with the second opening, take its other branch, return from a pause, and go back to welcome.

Tests choose entry samples inside their isolated browser contexts; the app has no testing-only
routes or controls. Assertions use visible roles and labels with Playwright's
[retrying assertions](https://playwright.dev/docs/test-assertions). The complete journey also checks
for page and console errors.

`npm run test:e2e` type-checks and builds before running the tests. Playwright's
[`webServer` configuration](https://playwright.dev/docs/test-webserver) starts a private preview on
port 4175 and stops it afterward. Existing servers are not reused. `npm run check` includes the same
browser tests after the unit tests and build. Install the matching headless browser first with
`npm run test:e2e:install`.

On this machine, a sandboxed run passed the code checks but Windows denied Chromium process launch
with `spawn EPERM`. The browser tests passed when rerun with the required process permissions.
This was an execution-environment restriction, not an application test failure.

## Remaining boundaries

The first playable milestone is complete. Step 06 finishes responsive visual design. Step 07 adds
browser Back/Forward, transitions, and interaction refinement. Firefox, WebKit, automated
accessibility scans, real screen-reader checks, and physical phone testing remain later checks.
Mobile emulation is not a physical-device test.
