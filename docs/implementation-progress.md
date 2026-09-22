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
