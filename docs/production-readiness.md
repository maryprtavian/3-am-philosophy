# Production readiness — Step 11

Prepared 23 September 2026. The local production candidate is ready for free static hosting.
It has not been deployed. Step 10's broader browser/accessibility audit was deferred at the user's
request; their initial manual testing does not yet identify tested devices or browser versions.

## Build and recovery

- The HTML contains a styled loading message and reload link even if the entry script cannot
  download. Inline fallback CSS keeps it readable when external styles are unavailable.
- JavaScript-disabled browsers get one main region explaining how to enable JavaScript.
- The app module loads inside a handled import promise, covering download and initialization
  failures. A React error boundary covers rendering failures. Both give a focused error heading
  and a reload link explaining that the visit starts fresh.
- Reload uses ordinary navigation. There is no automatic reload loop, error telemetry service,
  or new dependency. The boundary does not claim to catch arbitrary event-handler exceptions.
- Added an SVG favicon, a 1200 × 630 PNG social card, page description/title, theme colors, and
  Open Graph/Twitter metadata. The SVG source and renderer live in `scripts/`; the PNG is committed
  so deployment builds do not require a browser. `npm run assets:social` regenerates it when needed.
- `SITE_URL`, or Cloudflare's `CF_PAGES_URL` when unset, supplies absolute sharing/canonical URLs.
  These tags remain absent until an address is available. In-memory build checks verified both
  settings and rejection of an HTTP origin, without changing the upload build.

## Asset budget

Measured with Node's `gzipSync` default settings over each generated file. Totals include **all**
JavaScript chunks, including the app/content chunk required before the opening button appears.

| Metric                                                       |                  Result |
| ------------------------------------------------------------ | ----------------------: |
| JavaScript, summed gzip                                      | 77,148 bytes (77.15 kB) |
| JavaScript budget                                            |           150,000 bytes |
| CSS, summed gzip                                             |   1,980 bytes (1.98 kB) |
| Complete static folder, uncompressed, including social image |           302,586 bytes |
| Files in upload                                              |                       7 |

`npm run build` and `npm run check` fail if the JavaScript budget or Pages dashboard file limits
are exceeded. `npm run check:bundle` repeats this check against an existing `dist/` folder.
The social image is fetched by sharing services, not rendered in the app's opening screen.

## Throttled mobile measurement

Three fresh Chromium contexts, 390 × 844 viewport with touch/mobile emulation, cache disabled,
1.6 Mbps downstream, 0.75 Mbps upstream, 150 ms network latency, and 4× CPU slowdown. Served by
local Vite production preview on port 4176. Response headers confirmed gzip for JS and CSS.

| Cold load | Opening button observed | Last observed LCP before interaction | First question observed after click command |
| --------- | ----------------------: | -----------------------------------: | ------------------------------------------: |
| 1         |                2,419 ms |                             2,336 ms |                                      410 ms |
| 2         |                1,867 ms |                             1,704 ms |                                      589 ms |
| 3         |                2,060 ms |                             2,016 ms |                                      317 ms |

Median opening-button observation: **2.06 seconds**. Resource Timing reported 80,328 transferred
bytes for subresources in each run; this excludes the HTML navigation. These are local laboratory
observations, not real-device data, a Lighthouse score, field Core Web Vitals, or an INP measurement.
Click observations include automation/scheduling overhead. Hosted network behavior still needs
verification in Step 13.

To reproduce, first build, then run in separate terminals:

```sh
npm run preview -- --host 127.0.0.1 --port 4176 --strictPort
npm run measure:production
```

The second command writes `artifacts/performance.json`. Keep other browser tests stopped during
measurement. Install the matching Playwright Chromium browser first if necessary.

## Verification

- TypeScript, ESLint, Prettier, 117 content/engine tests, production build, and asset budget checks.
- 70 Chromium browser scenarios: 10 journeys, 18 navigation/interaction, 28 responsive-layout,
  and 14 production cases across desktop/light and mobile/dark.
- Production cases exercise initial-script failure, app-download failure, module initialization
  failure, render failure, reload recovery, JavaScript-disabled mode, metadata, and image assets.
- After initial loading, a browser test switches the context offline, answers questions, goes
  back, reaches a pause, starts another rabbit hole, and leaves. **Zero requests** occur during
  those actions. This is an already-open offline visit, not an installable/offline-first PWA;
  loading or reloading still needs the site to be available.
- Existing refresh/history checks and the full responsive/content suite run against the optimized
  build. Social card and JavaScript-disabled mobile appearance were visually inspected.

## Remaining work

- Step 10: axe, Firefox/WebKit, physical iOS/Android devices, and spoken screen-reader checks.
- Step 12: remote repository and CI, if choosing automatic Git deployments.
- Step 13: account connection/upload, final address, hosted checks, and final sharing metadata.
- Step 14: resolve remaining findings and launch. See the [free deployment guide](./free-deployment.md).
