# Free deployment

Decision, checked 23 September 2026: use **Cloudflare Pages Free** with Git integration and its supplied
`pages.dev` address. The app is entirely static. It needs no paid domain, database, server,
Functions, AI service, or account system. Cloudflare currently advertises free signup without
a credit card and unlimited static requests/bandwidth. Keep the account on the free plan.
See [Cloudflare Pages](https://www.cloudflare.com/products/pages/).

## What is ready

- `npm run build` generates the complete site in `dist/` and enforces the asset budget.
- The initial upload ZIP is `artifacts/3-am-philosophy.zip`. Its root contains `index.html`,
  `assets/`, the favicon, and the social image. Only these public build files belong in the upload.
- A [production report](./production-readiness.md) records the checks and remaining verification.
- The selected GitHub repository is [maryprtavian/3-am-philosophy](https://github.com/maryprtavian/3-am-philosophy).
  Use the Git route below for automatic updates. No site has been published or Cloudflare project connected yet.

## Alternative: dashboard upload

The selected route is Git integration. Keep the ZIP as an optional manual-upload alternative.

1. Create or sign into your free [Cloudflare account](https://dash.cloudflare.com/sign-up).
2. Open **Workers & Pages → Create application** and choose **Pages / Direct Upload**
   (the dashboard may label this **Drag and drop files**).
3. Choose a project name, for example `3-am-philosophy`, subject to availability.
4. Upload `artifacts/3-am-philosophy.zip` or the **built `dist` folder**. Do not upload the
   repository, `src`, `node_modules`, or environment files. Select **Deploy site**.
5. Copy the assigned HTTPS `pages.dev` address and share it in this task. This is public hosting.
6. We will set that address as `SITE_URL`, rebuild and replace the upload, and check the hosted
   journeys and sharing metadata. Continue the remaining Step 10 checks before calling it launched.

Cloudflare assigns the subdomain and may adjust an unavailable name. The dashboard accepts ZIPs
and folders, with a 1,000-file limit and 25 MiB per file. This build has seven files and is well
below those limits. See [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

**Tradeoff:** this route uses manual uploads for updates. Cloudflare does not let an existing
Direct Upload project switch to Git integration; moving to automatic Git builds requires a new
Pages project. If automatic deployment on every push is the priority, use the Git route below
from the beginning. Both routes can use the free plan.

## Git deployment for automatic updates

This follows Steps 12–13 of the original roadmap. The user supplied
[maryprtavian/3-am-philosophy](https://github.com/maryprtavian/3-am-philosophy), an empty public
repository, for the initial push and CI setup. Once the first check passes:

1. Sign into your free Cloudflare account and open **Workers & Pages → Create application → Pages**.
2. Choose **Import an existing Git repository / Connect to Git** and authorize access to this repository.
3. Select `maryprtavian/3-am-philosophy` and enter the build settings below.
4. Deploy using the free `pages.dev` address and share the assigned URL in this task for hosted verification.

| Setting                      | Value                                  |
| ---------------------------- | -------------------------------------- |
| Production branch            | `main`                                 |
| Root directory               | Repository root                        |
| Build command                | `npm run build`                        |
| Build output directory       | `dist`                                 |
| Node                         | 22, selected by the committed `.nvmrc` |
| Runtime, Functions, bindings | None                                   |
| Domain                       | The assigned free `pages.dev` address  |

The lockfile controls dependency versions. Run `npm run check` before pushing a release; the
host's build command checks types, builds, and checks bundle size but does not run browser tests.
Repository CI is configured in `.github/workflows/ci.yml`; see the [release guide](./releasing.md).
Cloudflare's Git build runs independently of GitHub CI, so only merge reviewed changes with passing checks.
The build reads Cloudflare's `CF_PAGES_URL` for absolute metadata when
`SITE_URL` is unset; set `SITE_URL` to the final production origin when ready to share that address.
Cloudflare's free plan currently includes 500 builds/month. See the
[Vite setup](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/) and
[Pages limits](https://developers.cloudflare.com/pages/platform/limits/).

## Set the final sharing URL

For local builds, create an ignored `.env.local` with the assigned origin:

```dotenv
SITE_URL=https://YOUR-ASSIGNED-NAME.pages.dev
```

Replace the example with the actual address. Use the site origin only, without a path, query, or
fragment. `npm run build` then writes an absolute canonical URL, `og:url`, and PNG image URLs
into the static HTML. This setting is public metadata, not a secret. Until the address is known,
the build deliberately omits these URL-dependent tags instead of publishing a guessed address.

Run the checks and build, then package the **new** output. In PowerShell from the project root:

```powershell
npm run check
New-Item -ItemType Directory -Force -Path artifacts | Out-Null
Compress-Archive -Path dist/* -DestinationPath artifacts/3-am-philosophy.zip -Force
```

On this machine, use the [documented npm launcher workaround](../README.md#windows-npm-launcher-troubleshooting)
if the ordinary npm command fails. macOS/Linux users can upload the `dist` folder directly.
`artifacts/` and `dist/` are generated output and are not committed to Git.

## Check the hosted preview and update it

- Open the assigned HTTPS address on desktop and a real phone; check light/dark appearance,
  one complete rabbit hole, backtracking, another opening, browser Back/Forward, and refresh.
- Confirm refresh starts a fresh visit and assets load without console errors.
- Check the page source for the actual canonical and social-image URLs and open the image URL.
  Sharing services may cache their previews after an upload.
- For Direct Upload updates, use **Create a new deployment** on the same project and upload the
  newly built ZIP. Keep the previous successful ZIP until the new version is verified.
- Pages supports rolling back to an earlier successful production deployment; a previous ZIP can
  also be deployed again. See [rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/).

The Cloudflare account connection, hosting address, and hosted smoke-test results remain pending. Prices and
limits above describe the current free plan, not a guarantee about future provider policies.
