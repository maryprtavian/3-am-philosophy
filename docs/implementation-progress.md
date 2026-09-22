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
