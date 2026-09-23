# Repository checks and releases

Repository: [maryprtavian/3-am-philosophy](https://github.com/maryprtavian/3-am-philosophy).
Production branch: `main`. This is a public repository. The live site is
[3 A.M. Philosophy](https://3-am-philosophy.maryprtavian.workers.dev/), hosted on Workers Static Assets.

## Reproduce the checks

Use Node 22 from `.nvmrc`, clone the repository, and run:

```sh
npm ci
npm run test:e2e:install
npm run check
```

On a fresh Linux machine, replace the browser installation command with
`npx playwright install --with-deps --only-shell chromium` to install system dependencies too.
The Windows npm launcher workaround is in the [README](../README.md#windows-npm-launcher-troubleshooting).

`npm run check` runs TypeScript, ESLint, formatting, content and engine tests, the production
build, the 150 kB gzip JavaScript budget, and Playwright against that build. It does not deploy.
Port 4175 must be available. See [content authoring](./content-authoring.md) when changing questions;
update relevant tests and route documentation alongside the content.

## GitHub Actions

[CI](https://github.com/maryprtavian/3-am-philosophy/actions/workflows/ci.yml) runs on pushes to
`main`, pull requests targeting `main`, and manual dispatch. The single Ubuntu 24.04 job uses
Node 22, installs the exact lockfile with `npm ci`, installs matching headless Chromium and Linux
libraries, then executes the same `npm run check` used locally.

The standard hosted runner is free for this public repository. No larger runners, artifact
uploads, dependency caches, paid integrations, deployment tokens, or additional secrets are
configured. One job has a ten-minute limit; a newer run cancels an older run for the same ref.
Checkout and Node setup actions are pinned to verified commit SHAs with version comments.
See [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

Read failed checks in the Actions log. Reproduce locally to inspect the screenshots and traces in
`test-results/`. Chromium coverage currently includes 117 unit tests and 70 browser scenarios;
Firefox, WebKit, axe, physical devices, and spoken screen-reader verification remain Step 10 work.

## Change and release workflow

1. Make a focused change, preferably on a `codex/` branch, with content/behavior tests as needed.
2. Run `npm run check`, commit source and documentation, push, and review the GitHub CI result.
   Do not commit `dist`, `node_modules`, local environment files, or generated ZIPs.
3. Before merging a pull request, confirm the check named **Typecheck, lint, tests, and build**
   passes. Repository branch protection is not configured by this change; CI reports failures
   but does not itself prevent direct pushes or merges.
4. Follow the connected Cloudflare Workers setup in the [free deployment guide](./free-deployment.md). GitHub CI
   and Cloudflare's Git builds run independently: Cloudflare does not automatically wait for CI.
   Merge reviewed, passing pull requests into `main`; check both systems after a release.
5. Record the release commit and hosted URL, smoke-test the deployment on desktop and a phone,
   and verify absolute sharing URLs. Keep a previous successful production deployment available
   for rollback. Deployment and hosted smoke tests are Step 13; launch is Step 14.

The existing [production report](./production-readiness.md) records size/performance measurements
and recovery behavior. Repeat relevant checks when application assets change. Dependency updates
must update `package-lock.json` and pass the full check; do not upgrade dependencies implicitly
as part of a content-only release.
