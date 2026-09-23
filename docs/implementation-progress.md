# Implementation progress

## Step 01 — Project foundation

Status: complete, 23 September 2026.

### What changed

- Initialized a local Git repository and retained the design research and implementation roadmap.
- Started from the official Vite React/TypeScript scaffold and replaced its demo screen and assets
  with a minimal project landing screen.
- Separated UI components, shared styles, and the reserved content and engine directories.
- Enabled strict TypeScript, checked indexed access, exact optional properties, unused-code checks,
  and filename-casing checks for app and Vite configuration code.
- Added ESLint with typed rules, React Hooks checks, and Fast Refresh checks. Added Prettier and
  disabled conflicting ESLint formatting rules.
- Added npm commands for development, production builds/previews, type checks, linting, formatting,
  and the combined quality gate.
- Selected Node 22 LTS, recorded its minimum compatible version, and added `.nvmrc`, npm engine
  enforcement, `.editorconfig`, `.gitattributes`, and ignore files.
- Documented setup, commands, source boundaries, and the next steps in the README.
- Generated the npm dependency lockfile and verified a fresh installation against it.

The installed core versions are React/React DOM 19.3.0, Vite 8.3.0, TypeScript 6.0.3, ESLint 10.11.0,
and Prettier 3.9.8. The full dependency tree is recorded in `package-lock.json`.

### Environment finding

The system's global npm launcher resolves to a missing npm CLI. The bundled CLI at
`C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js` runs correctly when invoked through Node.
Setup uses that CLI directly and leaves the global installation unchanged. The README contains a
PowerShell workaround for running the normal project commands.

### Verification

All checks below passed using Node 22.14.0 and the bundled npm 10.9.2 CLI:

- `npm ci --offline --no-audit --fund=false --cache=.npm-cache`: recreated the dependency tree from
  the lockfile and the packages downloaded during setup.
- `npm run check`: TypeScript project checks, type-aware ESLint with no warnings, Prettier checks,
  and the optimized Vite build all completed successfully.
- `npm ls --depth=0`: all declared top-level dependencies resolved without dependency errors.
- Development server: the local page at `http://127.0.0.1:5173/` rendered the app heading and tagline
  with no browser console errors.
- Production preview: the built page at `http://127.0.0.1:4173/` rendered the same content and styling
  with no browser console errors.
- Git ignore checks confirmed dependencies, build output, and the local npm cache are excluded.

The initial production JavaScript bundle measures 68.74 kB gzip. This is a foundation measurement,
not the final app's performance result. Browser verification used the Codex in-app browser; full
browser, accessibility, and physical-device checks remain scheduled for later steps.

### Scope boundary

The landing screen confirms the toolchain works. Question types and graph validation begin in Step 02. Branching behavior, the complete interface, automated behavior tests, and deployment belong to
their later steps.

## Step 02 — Content contract and validation

Status: complete, 23 September 2026.

### What changed

- Added readonly types for the five themes, stable node IDs, answer labels and destinations,
  questions, pauses, and a complete collection.
- Questions require exactly two choices at the type level. Pauses are a separate node kind with no
  choices. Nodes remain an array so duplicate IDs can be detected before indexing.
- Added a small typed example with two distinct opening branches and a shared pause. It illustrates
  the contract for tests and authors; the full first rabbit hole belongs to Step 03.
- Implemented `validateContent` as a pure function accepting unknown input and returning either a
  reconstructed, checked graph or issues containing a code, field path, and explanation.
- Validation first checks field shapes and text, then references, then graph integrity. This avoids
  reporting misleading reachability errors caused by malformed data or broken references.
- Added checks for duplicate IDs and entries, missing destinations, unreachable nodes, cycles,
  absent pauses, and questions with no path to a pause. Shared branches and multiple entry points
  are supported.
- Added Vitest 5.0.1, a Node test configuration, `npm test`, and `npm run test:watch`. The combined
  `npm run check` command now runs the tests before the production build.
- Added the authoring guide with field rules, connection rules, examples, and editorial guidance.
  Human review remains responsible for balanced answers and meaningful follow-up questions.

### Verification

- All **59 validator tests passed**. They cover the valid example, merging branches, multiple entry
  points, all themes, Unicode, input preservation, malformed fields, sparse arrays, duplicate IDs,
  broken references, unreachable content, loops with exits, and trapped branches.
- `npm run check` passed TypeScript, type-aware ESLint with no warnings, formatting, all tests, and
  the production build.
- The production bundle is unchanged because the new contract, example, and validator are not yet
  connected to the UI. Browser checks were not repeated for this data-only step.

### Scope boundary

The validator is ready to check the playable collection when it is written in Step 03. That
collection must be explicitly included in a validation test; arbitrary content exports are not
automatically discovered. Session traversal remains Step 04, and the interactive UI remains Step 05.

## Step 03 — First complete rabbit hole

Status: complete, 23 September 2026.

### What changed

- Expanded the immortality premise into 14 questions and three reflective pauses. Its 18 complete
  answer sequences contain four or five questions each.
- Added a shorter perfect-copy collection with five questions, one pause, and eight complete answer
  sequences of three questions each.
- Added `src/content/library.ts` as the single combined `content` export for the future session
  engine. The minimal contract example remains separate from the authored library.
- Included distinct follow-up questions for both starting answers and controlled convergence deeper
  in the graph. Final answers can share a pause without being scored or judged.
- Added an invitation to keep thinking or explore another rabbit hole to every pause.
- Included a long-content case at `keeping-memories`: a 154-character question and an answer of 66
  characters, ready for the later mobile/desktop layout checks.
- Enumerated and read all 26 complete question/answer sequences. Reviewed shared questions against
  every incoming answer, and refined the wording around forgotten kindness and remembered promises.
- Registered the combined library in six integration tests covering validation, path lengths,
  distinct opening branches, and convergence only at a pause when both answers share a destination.
- Updated the authoring instructions and recorded the route inventory and editorial decisions in
  `docs/starter-content-review.md`.

### Verification

- All **65 tests passed**: the existing 59 validator tests plus six library tests.
- `npm run check` passed TypeScript, ESLint with no warnings, formatting, tests, and the production
  build. There are no new dependencies.
- The full library passes graph validation: 19 questions, four pauses, and two entry points, with
  no duplicate IDs, broken links, unreachable nodes, or cycles.
- Editorial review covered every complete answer sequence. This was a review of the authored data;
  external user feedback and visual layout checks have not been performed for these questions yet.

### Scope boundary

The content is ready to drive a session. Entry-point selection, answering, backtracking, and restart
behavior remain Step 04; the browser's question interface remains Step 05. The larger 40–60-question
v1 library remains Step 09.

## Step 04 — Branching and session engine

Status: complete, 23 September 2026.

### What changed

- Added a pure session reducer with start, answer, back, forward, leave, another-hole, and full-reset
  actions. The engine validates and indexes the content once, independently of React.
- Separated the route, current position, and visited openings from authored text. The route records
  the selected answer even when both choices share a pause.
- Implemented back/forward navigation through the route and back from the entry to welcome.
  Answering after going back replaces all forward history; forward navigation restores it without
  selecting a new answer.
- Entry selection takes a supplied random sample, so reducers stay deterministic. It prefers
  unseen openings and explicitly reports when only revisits remain. Revisits avoid the last opening
  when another is available and still work for a single-opening collection.
- Leaving and starting another hole clear the route while preserving visited openings. A full reset
  clears the entire visit. State remains in memory, ready for the upcoming UI integration.
- Invalid or unavailable actions leave state unchanged. Answers identify their question, allowing
  the engine to reject a duplicate event from a question that is no longer current.
- Added an engine guide covering the API, navigation boundaries, finite-content wording, and the
  division between reducer behavior and later browser integration. No new dependencies were needed.

### Verification

- All **103 tests passed**: the existing 65 content/validator tests plus 38 engine tests.
- Engine tests cover transitions, both answers, pause/back/restart behavior, branch replacement,
  deterministic selection, exhaustion, a single-entry library, invalid actions, and frozen inputs.
- Integration cases traverse all **26 complete starter-library routes** through the reducer,
  verify back/forward at every answer, and enter the other opening from every pause.
- `npm run check` passed TypeScript, ESLint with no warnings, formatting, all tests, and the
  production build. The current UI bundle remains unchanged because engine integration is Step 05.

### Scope boundary

The complete session behavior is ready and tested independently of rendered components. The local
page still shows the foundation screen. Step 05 connects the real content and engine to welcome,
question, and pause views and adds a browser smoke test. Responsive styling remains Step 06;
History API integration, transitions, and full rapid-input/focus handling remain Step 07.

## Step 05 — First playable interface

Status: complete, 23 September 2026.

### What changed

- Connected the authored library and session engine to React with `useReducer`, keeping content
  and transitions independent of rendering.
- Replaced the foundation screen with welcome, question, and pause views. Welcome has exactly one
  button; each question has two equal-emphasis answers and quiet back/leave navigation.
- Added another-hole and revisit actions with wording that acknowledges the finite collection.
  Leaving preserves tried openings, and refresh starts a fresh visit.
- Used semantic headings, native buttons, plain-text rendering, visible focus, and heading focus
  after navigation. Pause text is associated with its heading as an accessible description; no
  live region competes with the focus announcement strategy.
- Added the first readable CSS layout and control styles in the agreed palette, with stacked
  answers, long-label wrapping, and light/dark appearance following the system.
- Added Playwright Test 1.63.0 and a pinned lockfile update, a managed production-preview test
  server, browser installation/test scripts, and strict TypeScript/ESLint coverage for browser tests.
- Added four browser scenarios in desktop/light and mobile/dark configurations. The combined
  quality gate now includes these eight checks after the existing unit tests and build.
- Updated setup instructions and documented the first playable milestone and remaining boundaries.

### Verification

- All **103 content/engine tests** and **eight Playwright browser tests** passed. Browser coverage
  includes both openings, pauses, backtracking, changing an answer, leaving, revisiting, refresh,
  keyboard activation, focus movement, and accessible pause descriptions.
- TypeScript, typed ESLint, Prettier, and the production build passed. The initial browser run was
  blocked by Windows sandbox process-launch permissions (`spawn EPERM`); rerunning with the required
  execution permissions passed all eight scenarios.
- Manually completed a route and started another in the in-app browser. Inspected the desktop
  question view, pause view, and the longest question at 390 CSS pixels. The narrow view had no
  horizontal overflow and the long-answer controls wrapped at approximately 342 × 82 CSS pixels.
- The production JavaScript bundle is **73.37 kB gzip**, with **0.96 kB gzip** of CSS. This includes
  the actual library, validator, session engine, and interactive UI.

### Scope boundary

The app is now playable locally. The initial browser checks use Chromium and mobile emulation;
physical devices and spoken screen-reader output have not been tested. Step 06 refines responsive
visual design. Step 07 integrates browser history and finishes transitions and rapid-input handling.

## Step 06 — Responsive layout and visual design

Status: complete, 23 September 2026.

### What changed

- Established shared CSS tokens for the palette, typography, spacing, reading width, target sizes,
  radii, focus, and future motion. Kept styles in the existing CSS Module and global token sheet.
- Refined the serif question and opening typography, system-font controls, rounded primary action,
  and charcoal/ivory/amber and warm-paper appearances. Strengthened answer borders in both schemes.
- Implemented equal-width answer columns when short labels fit, with automatic stacking for longer
  labels and narrow screens. Intrinsic CSS sizing handles label length without a resize listener.
- Kept the reading region centered and capped at 608 pixels at the default text size, with fluid
  gutters and spacing. Long content scrolls naturally; short screens use tighter vertical spacing.
- Added dynamic viewport minimum height with fallbacks, safe-area padding, and `viewport-fit=cover`.
  Removed the fixed body minimum width and preserved text scaling and ordinary zoom behavior.
- Enforced at least 52-pixel answer targets and 44 × 44-pixel secondary controls, with wrapping
  labels, visible focus, and hover effects only on hover-capable devices.
- Added a separate responsive Playwright project and 20 layout checks; no dependencies were added.

### Verification

- `npm run check` passed type checking, ESLint, formatting, **103 unit tests**, the production build,
  and **28 browser tests** (eight existing journeys plus 20 new layout checks).
- Welcome, short-answer questions, the longest starter question/labels, and pause screens passed
  checks at 320, 375, 390, 768, and 1440 pixels, plus 844 × 390 and 1280 × 480, in both themes.
- Tests found no horizontal overflow, clipped text, overlapping content, or undersized controls.
  They also verified equal answer widths, appropriate stacking, and reachable navigation.
- Extra checks passed for 200% text size at 320 pixels, changing viewport height during a question,
  and computed text/control contrast in each scheme.
- Visually reviewed representative full-page browser captures across the matrix and inspected the
  updated opening screen in the in-app preview. Review details are in `docs/responsive-design.md`.
- Production assets measure **73.39 kB gzip** of JavaScript and **1.64 kB gzip** of CSS.

### Scope boundary

The responsive design step is complete. Physical notch/chrome behavior, actual browser zoom,
screen-reader output, Firefox, and WebKit remain later verification. Step 07 adds browser history,
screen transitions, and rapid-input handling using the established session engine and motion tokens.

## Step 07 — Navigation and interaction details

Status: complete, 23 September 2026.

### What changed

- Added a document-local browser adapter around the pure session engine. React observes its
  snapshots through `useSyncExternalStore`; the existing reducer still controls authored branching.
- Connected native Back/Forward and Go back to the same snapshot restoration. Leaving and opening
  another rabbit hole also participate in history, while tried openings remain remembered for the visit.
- Kept answers in memory and stored only opaque references in native history. Refresh starts a
  fresh visit; old references become welcome screens without trapping browser navigation.
- Added a 180 ms heading fade and an independent input guard, including repeated key and
  multi-click handling. Reduced motion removes the animation, and native history remains usable.
- Focused the heading once per navigation and reset the reading position for long questions.
  Timer completion does not repeat focus; no competing live region was added.
- Added 18 browser checks across desktop and mobile configurations and documented the behavior
  in [navigation and interaction](./navigation-and-interaction.md). No dependencies were added.

### Verification

- `npm run check` passed TypeScript, ESLint, formatting, **103 unit tests**, the production build,
  and **46 browser tests** (18 navigation/interaction, eight journey, and 20 layout checks).
- Browser tests cover branch replacement, leaving, previous pauses, refresh/stale references,
  exiting to the prior document, data boundaries, rapid clicks/taps, held keys, scroll restoration,
  one heading-focus event per navigation, and reduced motion.
- Manually verified Back/Forward and heading focus in the in-app preview, then refreshed to the
  fresh welcome screen. The captured browser console contained no warnings or errors.
- Production assets measure **74.20 kB gzip** of JavaScript and **1.75 kB gzip** of CSS.

### Scope boundary

Step 07 is complete with Chromium and emulated mobile input coverage. Focus events were verified;
spoken screen-reader output and real-device behavior were not. These remain Step 10 checks with
Firefox, WebKit, and browser zoom. Step 08 next reviews the experience before expanding the library.

## Step 08 — Experience review before expansion

Status: complete, 23 September 2026.

### What changed

- Reviewed four complete browser routes across the two openings, reread all starter questions and
  answer connections, and assessed mobile reading, desktop presentation, pacing, back/leave, and revisits.
- Found that pauses invited reflection while hiding the final question. The pause now retains that
  question, derived from the active trail, in a smaller serif paragraph with no additional controls.
- Included the retained question in the pause heading's accessible description. Shared pauses and
  restored history use the question from their own route rather than stale or duplicated text.
- Kept the existing question wording and route lengths after review. Recorded the rationale,
  remaining uncertainties, and content-expansion decisions in [experience review](./experience-review.md).
- Prepared a [short tryout guide](./tryout-guide.md) with neutral prompts and observation notes for
  future feedback. No external participant sessions were conducted.

### Verification

- `npm run check` passed TypeScript, ESLint, formatting, **103 unit tests**, the production build,
  and **48 browser tests** (10 journeys, 18 navigation/interaction, and 20 layout checks).
- The new journey verifies both routes into a shared pause, changing an earlier answer, the
  accessible description, absence of stale text, and restoration through Back/Forward.
- Reviewed the revised pause at 320, 390, and 1440 pixels in the in-app browser and production
  captures in desktop/light, phone/dark, and landscape/light layouts. Existing layout checks passed
  in both themes and with enlarged text. The in-app console had no errors or warnings.
- Production assets measure **74.27 kB gzip** of JavaScript and **1.79 kB gzip** of CSS.

### Scope boundary

This is an independent walkthrough and editorial review, not evidence from first-time participants.
External feedback is pending and the tryout material is ready. Physical devices and spoken
screen-reader output remain later verification. Step 09 next expands and reviews the question library.

## Step 09 — Full question library

Status: complete, 23 September 2026.

### What changed

- Added four authored collections: perfect dreams, borrowed time, unheard music, and words/silence.
  The library now has **51 questions, six openings, and eight pauses** across the five themes.
- Kept the original question wording and branches, and tagged the copy opening as identity.
  New routes have four questions; the existing routes retain their reviewed lengths.
- Reviewed all answer links, the twelve new shared questions, and the final alternatives leading
  to pauses. Refined the art route's shared ending and the sole-listener answer for clearer connections.
- Recorded the theme distribution, editorial decisions, and all **90 answer sequences** in the
  [library review](./library-review.md) and [route inventory](./library-route-inventory.md).
- Generalized library/engine coverage to every registered opening. Updated browser journeys for
  six-opening exhaustion and added eight narrow-layout scenarios covering every new content node.
- Kept content bundled locally; no dependencies, backend, or new application controls were added.

### Verification

- `npm run check` passed TypeScript, ESLint, formatting, **117 unit tests**, the production build,
  and **56 browser tests** (10 journeys, 18 navigation/interaction, and 28 layout checks).
- All 90 routes traverse the reducer, every destination resolves, all nodes are reachable, and
  every route reaches a pause without a cycle. Every opening has distinct initial branches.
- Browser journeys complete a representative path from each opening on desktop and mobile and
  offer revisits only after all six openings have been tried. History preserves tried openings.
- Every new question and pause passed 320-pixel layout checks in both themes, including clipping,
  overlap, control size, stacking, and reachable navigation. The longest existing content remains covered.
- Read new routes in the in-app phone preview and reviewed narrow-screen production captures.
  External participant feedback, physical devices, and spoken screen-reader testing remain pending.
- Production assets measure **76.77 kB gzip** of JavaScript and **1.79 kB gzip** of CSS.

### Scope boundary

The content expansion is complete. Step 10 next performs the broader accessibility and browser
verification, including axe, Firefox/WebKit, and the remaining manual checks where available.

## Step 10 — Deferred verification

On 23 September 2026, the user reported some initial manual testing and asked to proceed with
Step 11 while continuing tests later. No device/browser inventory or detailed findings have been
provided. The broader audit remains open; earlier Chromium verification still applies.

## Step 11 — Production preparation and free hosting handoff

Status: complete, 23 September 2026. Hosting and final URL-dependent metadata remain Step 13.

### What changed

- Added a readable static loading/reload fallback, a JavaScript-disabled view, handled app-module
  initialization, and a React render-error boundary with focused recovery and a fresh-visit reload.
- Added page metadata, theme colors, a moon favicon, and a typographic 1200 × 630 social image.
  Final absolute sharing URLs are generated from `SITE_URL` or Cloudflare's build address.
- Enforced a 150 kB gzip JavaScript budget and dashboard upload limits during production builds.
- Added repeatable throttled mobile measurement and production browser checks without adding dependencies.
- Prepared an upload ZIP and [free deployment instructions](./free-deployment.md). Cloudflare Pages
  Free with its `pages.dev` address fits this static app; a purchased domain and paid services are unnecessary.

### Verification

- TypeScript, lint, formatting, 117 unit tests, 70 browser scenarios, and the production build/budget.
- Failure cases cover blocked scripts, failed imports, initialization, rendering, and working reloads
  on desktop/mobile. Corrected a test locator for text inside `noscript`; the displayed page was correct.
- Offline interaction tests report zero requests after initial loading, including answers, backtracking,
  a pause, another opening, and leaving. Existing content/history/layout checks continue to pass.
- JavaScript: **77.15 kB gzip**; CSS: **1.98 kB gzip**; seven public files total.
- Three throttled cold loads observed the opening button in **1.87–2.42 seconds** (median 2.06).
  These are local emulation measurements, with gzip delivery, not hosted or real-device results.
- Verified both metadata environment inputs and rejection of an insecure origin in in-memory builds.
  Visually inspected the social image and the JavaScript-disabled mobile layout.

See [production readiness](./production-readiness.md) for methods and results. No account was
connected, no remote was configured, and no public deployment was made. The user can create the
free Cloudflare account and choose dashboard upload or Git integration using the prepared guide.

## Step 12 — GitHub repository and CI

Status: complete, 23 September 2026.

The user supplied `https://github.com/maryprtavian/3-am-philosophy.git` and selected Git deployment.
The repository was verified empty and public before the first push.

- Added GitHub Actions for pushes and pull requests to `main`, plus manual dispatch.
- A single standard Ubuntu runner installs Node 22, runs `npm ci`, installs Chromium and its
  Linux dependencies, and runs the existing complete quality check. Actions use pinned SHAs,
  read-only repository permissions, a ten-minute timeout, and cancellation of superseded runs.
- Uses free standard runner execution for this public repository, with no artifact uploads or
  dependency cache storage. No paid service or deployment credential was configured.
- Added the [release guide](./releasing.md), linked content-authoring instructions, and updated
  the Cloudflare handoff to the selected Git workflow.
- CI and Cloudflare builds are independent. Branch protection and deployment are not configured;
  the documented procedure is to review passing pull requests before merging into `main`.

### Verification

- Added `origin`, pushed the full local history and CI setup to `main`, and set upstream tracking.
- [GitHub CI run 35872452751](https://github.com/maryprtavian/3-am-philosophy/actions/runs/35872452751)
  passed for commit `756b1f083d2dd509e652f138d6ba7104a079c951` on a clean Ubuntu runner.
- Lockfile installation, Chromium/Linux setup, TypeScript, ESLint, Prettier, 117 unit tests,
  the production build/budget, and all 70 browser scenarios passed in GitHub Actions.
- The result-recording commit changes documentation only and skips a redundant CI run. Application
  code, dependencies, configuration, and the workflow match the verified commit.
- Cloudflare account authorization, the hosted address, and hosted smoke checks remain Step 13.

## Step 13 — Hosted app and final sharing metadata

Status: complete within the recorded hosted smoke-test scope, 23 September 2026. The broader
Step 10 audit and final launch review remain open.

- The user connected GitHub to Cloudflare Workers Static Assets and supplied both a version URL
  and the stable production URL: **https://3-am-philosophy.maryprtavian.workers.dev/**.
- Workers static hosting replaces the original Pages plan and supports free static requests.
  No paid domain, service, or subscription setting was enabled by the agent.
- Added the stable production origin as the build default because Workers does not supply
  `CF_PAGES_URL`. Explicit `SITE_URL` overrides remain available for a future address change.
- Pushed application commit `1d0790013cb2305a7f3e313c30409f4ae0c28d05`; the connected deployment
  published the correct absolute canonical and social-image URLs, verified in HTTP HTML and DOM.
- [CI run 35875198564](https://github.com/maryprtavian/3-am-philosophy/actions/runs/35875198564)
  passed TypeScript, lint, formatting, 117 unit tests, build/budget, and 70 browser scenarios.
- Walked a full hosted route, pause, another opening, backtracking, alternate answers, browser
  Back/Forward, leaving, and refresh. Checked 320/390/1440 viewport widths, asset status/MIME types,
  cache headers, and the absence of browser console warnings/errors. Viewport overrides were reset.
- Updated the hosting/release instructions for Workers, including version versus stable URLs and
  the documented rollback procedure. See [hosted verification](./hosted-verification.md) for limits:
  the hosted walkthrough used dark appearance; both appearances passed production-build CI.

This is not a claim of physical-device or spoken screen-reader testing. Those remain in Step 10.
