# 3 A.M. Philosophy

One button, strange philosophical questions, and branching rabbit holes.

Steps 1–7 are complete. The responsive interface connects 19 authored questions across two
openings to the session engine. Start with one button, follow two-answer questions to a pause, go
back, leave, or explore another rabbit hole. Refresh starts a new visit. Light/dark appearance
follows the system, and answer layouts adapt to screen width and label length. Browser Back/Forward
restores screens within the visit; brief transitions respect reduced motion and guard rapid input.

## Requirements

- Node.js **22 LTS**, version **22.13.0 or newer within the 22.x line**, is the project's selected
  runtime. Use the newest available patch in that line. `.nvmrc` selects Node 22.
- Node.js 24 LTS is also accepted by the engine constraints.
- npm 10 or 11. The initial setup uses Node 22.14.0 and npm 10.9.2.

The package engine check rejects unsupported runtimes. Exact dependency versions are recorded in
`package-lock.json`; keep that file in version control and use `npm ci` for reproducible installs.

## Run locally

```sh
npm ci
npm run dev
```

Open the local address printed by Vite, normally `http://localhost:5173`. The development server is
local to your computer by default.

## Commands

| Command                    | Purpose                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| `npm run dev`              | Start the development server with hot updates                           |
| `npm run build`            | Type-check and build the static site into `dist/`                       |
| `npm run preview`          | Serve the production build locally; run `build` first                   |
| `npm run typecheck`        | Check the app and Vite configuration with TypeScript                    |
| `npm run lint`             | Run ESLint, treating warnings as failures                               |
| `npm run lint:fix`         | Apply automatic lint fixes where available                              |
| `npm run format`           | Format project files with Prettier                                      |
| `npm run format:check`     | Check formatting without changing files                                 |
| `npm test`                 | Run content validation, library, and session behavior tests once        |
| `npm run test:watch`       | Rerun tests as files change                                             |
| `npm run test:e2e:install` | Install Playwright's headless Chromium browser                          |
| `npm run test:e2e`         | Type-check, build, and run browser journey and layout tests             |
| `npm run check`            | Run type checks, lint, formatting, unit tests, build, and browser tests |

`preview` is a local build check, not a production hosting server. Vitest runs the validator,
library, and session behavior tests in Node. Playwright tests the production build in headless
Chromium with desktop/light and mobile/dark journey configurations, plus a responsive matrix in
both themes from 320 to 1440 CSS pixels.

Before the first browser test run, install the matching browser:

```sh
npm run test:e2e:install
npm run check
```

Repeat browser installation after a Playwright upgrade. The runner starts and stops its own preview
server on `http://127.0.0.1:4175`; keep that port free. It does not reuse the development server.
Failure traces and screenshots go in the ignored `test-results/` directory. The layout matrix also
saves full-page review images there. See the [first playable version notes](docs/first-playable.md)
and [responsive design notes](docs/responsive-design.md) for layout coverage. The
[navigation notes](docs/navigation-and-interaction.md) explain history, refresh, interaction tests,
and remaining verification. There are currently 103 unit tests and 46 browser tests.

## Source layout

```text
src/
  main.tsx          React entry point
  components/      React UI and colocated CSS Modules
  content/         Types, authored collections, combined library, and content tests
  engine/          Content validator, pure session engine, browser adapter, and tests
  styles/          Shared styles and design tokens
public/            Static assets copied into the build
e2e/               Playwright browser journeys against the production build
docs/              Research, implementation roadmap, and progress notes
```

Keep questions separate from the UI, and keep traversal logic independent of React. Use CSS Modules
for component styles and CSS custom properties for shared values. Shared design tokens live in
`src/styles/global.css`. A document-local store connects the pure engine to browser history through
React's `useSyncExternalStore`; answers remain in memory. Step 8 reviews the experience before
expanding the library.

## Development conventions

- TypeScript strict mode, checked indexed access, and exact optional properties are enabled for app
  and build configuration code.
- ESLint checks TypeScript with type information, React Hooks, and Vite Fast Refresh conventions.
- Prettier owns formatting; ESLint's conflicting formatting rules are disabled.
- Run `npm run check` before considering a change ready for review.
- Generated files, local environment files, and caches are excluded from Git.

## Windows npm launcher troubleshooting

On the initial development machine, the global npm launcher resolves to a missing npm CLI. If
`npm --version` reports a missing `npm-cli.js`, the CLI bundled alongside Node can be used directly
without changing the global installation:

```powershell
$npmCli = Join-Path (Split-Path (Get-Command node).Source) 'node_modules/npm/bin/npm-cli.js'
node $npmCli ci
node $npmCli run dev
```

The same prefix supports the other commands, for example `node $npmCli run check`. This workaround
assumes a Windows Node installation with its bundled npm present; it is unnecessary on a healthy
installation.

## Project documents

- [Design and technical direction](docs/design-and-technical-direction.md)
- [Implementation roadmap](docs/implementation-roadmap.md)
- [Implementation progress](docs/implementation-progress.md)
- [Content contract and authoring guide](docs/content-authoring.md)
- [Starter content review](docs/starter-content-review.md)
- [Session engine and integration guide](docs/session-engine.md)
- [First playable version and browser checks](docs/first-playable.md)
- [Responsive design and layout verification](docs/responsive-design.md)
- [Browser navigation and interaction behavior](docs/navigation-and-interaction.md)
