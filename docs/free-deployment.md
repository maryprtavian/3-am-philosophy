# Free deployment

Live site: **https://3-am-philosophy.maryprtavian.workers.dev/**.

The user connected GitHub and deployed with **Cloudflare Workers Static Assets**, rather than the
originally proposed Pages service. This is a suitable host for the existing static React/Vite app.
There is no need to migrate or purchase a domain. Cloudflare documents static asset requests as
free and unlimited, with no extra asset storage charge; Worker-script execution has separate
limits/pricing. Keep the account on the Free plan and this app as static assets.
[Static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/).

## Address and updates

- Share the stable URL above. The earlier `4d801d99-3-am-philosophy.maryprtavian.workers.dev`
  address identifies one version and does not follow future production deployments.
  See [version URLs](https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/).
- Repository: [maryprtavian/3-am-philosophy](https://github.com/maryprtavian/3-am-philosophy), branch `main`.
- `npm run build` creates `dist/` and checks the asset budget. The current site serves those assets.
- The user confirmed GitHub is connected. Workers build settings are under **Settings → Build**;
  build and deploy commands are separate. Preserve the working asset deployment configuration.
  The expected build command is `npm run build` and generated asset directory is `dist`.
  See [Workers build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).
- GitHub CI and Cloudflare builds run independently. Review passing pull requests before merging,
  then check the new hosted version. See the [release guide](./releasing.md).

## Sharing metadata

Production builds default to the confirmed stable Workers address in `vite.config.ts`. They emit
an absolute canonical URL, `og:url`, and PNG sharing-image URLs. Local development omits that
production default. A future custom domain can override it with the public build variable `SITE_URL`.

`SITE_URL` must be an HTTPS origin with no path, query, fragment, or credentials. Set it as a **build**
variable, not only a runtime variable, and rebuild. No secret or paid integration is required.
The older `CF_PAGES_URL` fallback remains for compatibility with Pages builds.

## Hosted checks and rollback

Verify a complete journey, another opening, backtracking, browser Back/Forward, and refresh at the
stable address. Check the favicon, scripts, styles, and social image load successfully. Confirm the
HTML contains the stable canonical/image URLs, rather than a version URL. See
[hosted verification](./hosted-verification.md) for the actual results and remaining checks.

To roll back, open **Workers & Pages → 3-am-philosophy → Deployments**, select a previous successful
version, and use **Rollback**. Confirm the stable URL afterward. A rollback does not revert Git;
fix or revert the source before the next push so an automatic build does not restore the defect.
[Cloudflare rollback documentation](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/).

The local `artifacts/3-am-philosophy.zip` is an optional manual-upload artifact from Step 11; it is
not the source for Git deployments and may be older than the latest commit. Rebuild before making
a new ZIP. `dist/`, ZIPs, and local environment files stay out of Git.

The broader Step 10 audit, real-device testing, and final launch review remain open. Public HTTP
checks cannot verify the account's subscription or dashboard build settings; no paid setting has
been changed by the agent.
