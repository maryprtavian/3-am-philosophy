# 3 A.M. Philosophy

One button, strange philosophical questions, and branching rabbit holes.

Steps 1–2 establish the project foundation, typed content contract, and tested graph validator. The
app currently renders a minimal landing screen; the playable question collection and branching
behavior are planned for subsequent steps.

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

| Command                | Purpose                                                                   |
| ---------------------- | ------------------------------------------------------------------------- |
| `npm run dev`          | Start the development server with hot updates                             |
| `npm run build`        | Type-check and build the static site into `dist/`                         |
| `npm run preview`      | Serve the production build locally; run `build` first                     |
| `npm run typecheck`    | Check the app and Vite configuration with TypeScript                      |
| `npm run lint`         | Run ESLint, treating warnings as failures                                 |
| `npm run lint:fix`     | Apply automatic lint fixes where available                                |
| `npm run format`       | Format project files with Prettier                                        |
| `npm run format:check` | Check formatting without changing files                                   |
| `npm test`             | Run the content validator tests once                                      |
| `npm run test:watch`   | Rerun tests as files change                                               |
| `npm run check`        | Run type checks, lint, formatting checks, tests, and the production build |

`preview` is a local build check, not a production hosting server. Vitest runs the validator tests
in Node. Session behavior tests and browser tests will be added with their respective features.

## Source layout

```text
src/
  main.tsx          React entry point
  components/      React UI and colocated CSS Modules
  content/         Question/pause types and a small contract example
  engine/          Content validator and tests; traversal arrives in Step 4
  styles/          Shared styles and design tokens
public/            Static assets copied into the build
docs/              Research, implementation roadmap, and progress notes
```

Keep questions separate from the UI, and keep traversal logic independent of React. Use CSS Modules
for component styles and CSS custom properties for shared values. The current screen is a setup
placeholder; the full responsive design arrives in Step 6.

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
