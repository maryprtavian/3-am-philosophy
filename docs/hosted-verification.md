# Hosted verification — Step 13

Stable address: **https://3-am-philosophy.maryprtavian.workers.dev/**.

Status: hosted smoke checks and final metadata verified, 23 September 2026. This does not close
the deferred Step 10 audit or the final launch review.

The user supplied this address and confirmed connecting GitHub on 23 September 2026. The original
version address was `https://4d801d99-3-am-philosophy.maryprtavian.workers.dev/`. The deployed host
is Workers Static Assets, replacing the original Pages plan without changing the application.

## Verified on the live site

- HTTPS homepage returns 200 and renders the correct welcome screen and one opening button.
- Completed the unheard-song route to its pause, retaining the actual final question.
- Browser Back restores the final question and Forward restores the pause with reading focus.
- Another rabbit hole starts a different opening. In-app Go back restores the previous question;
  choosing the other answer follows the alternate branch. Leave returns to the welcome view.
- Refresh resets the visit and restores the initial Ask me a question button.
- No browser console errors or warnings were recorded during the hosted walkthrough.
- Checked the live reading layout at 390, 320, and 1440 CSS pixels. At 320, the inspected question
  had no horizontal overflow, answer targets about 77 pixels high, and 44-pixel secondary controls.
- Favicon, sharing PNG, both JS chunks, and both CSS files return 200 with the expected MIME types.
  Static responses use `public, must-revalidate, max-age=0` for browser caching.

These are browser viewport checks in the dark appearance, not physical phone tests. Both appearances
have existing Chromium production-build coverage; the broader Step 10 browser/accessibility audit,
real devices, and spoken screen-reader checks remain pending.

## Metadata correction

The initial deployment omitted absolute canonical and social-image URLs because Workers does not
provide the Pages-specific `CF_PAGES_URL`. Commit `1d0790013cb2305a7f3e313c30409f4ae0c28d05` adds the
confirmed stable origin as the production default while retaining `SITE_URL` overrides. It changes
the generated HTML, not the app's JS or CSS. The local build, type check, lint, formatting, and both
desktop/mobile metadata tests passed. The connected Git deployment published the update: both
the public HTML response and browser DOM contain the correct canonical URL and social image URL.
[GitHub CI run 35875198564](https://github.com/maryprtavian/3-am-philosophy/actions/runs/35875198564)
passed all checks, including 117 unit tests and 70 browser scenarios, for that commit. The subsequent
result-recording commit changes documentation only.

The generated production folder is 302,973 bytes across seven files; JS remains 77,148 bytes gzip
and CSS 1,980 bytes gzip. The earlier Step 11 measurements remain historical results.

The [deployment guide](./free-deployment.md) records the update and rollback procedure. No paid
service or account setting was enabled. Account subscription settings were not inspected.
