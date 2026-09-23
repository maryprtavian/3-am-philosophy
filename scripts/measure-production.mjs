import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

// Run against `npm run preview -- --host 127.0.0.1 --port 4176 --strictPort`.
const url = 'http://127.0.0.1:4176/'
const browser = await chromium.launch()
const samples = []
try {
  for (let run = 0; run < 3; run += 1) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    })
    try {
      const page = await context.newPage()
      const assetResponses = []
      page.on('response', (response) => {
        if (['script', 'stylesheet'].includes(response.request().resourceType())) {
          assetResponses.push({
            asset: new URL(response.url()).pathname,
            encoding: response.headers()['content-encoding'] ?? 'identity',
          })
        }
      })
      const cdp = await context.newCDPSession(page)
      await cdp.send('Network.enable')
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 150,
        downloadThroughput: 200_000,
        uploadThroughput: 93_750,
      })
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
      await page.addInitScript(() => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            performance.mark('observed-lcp', { startTime: entry.startTime })
        }).observe({ type: 'largest-contentful-paint', buffered: true })
      })
      await page.goto(url, { waitUntil: 'domcontentloaded' })
      await page
        .getByRole('button', { name: 'Ask me a question' })
        .waitFor({ state: 'visible', timeout: 15_000 })
      const readyMs = await page.evaluate(() => Math.round(performance.now()))
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            globalThis.requestAnimationFrame(() => globalThis.requestAnimationFrame(resolve)),
          ),
      )
      const timing = await page.evaluate(() => ({
        lcpMs: Math.round(performance.getEntriesByName('observed-lcp').at(-1)?.startTime ?? 0),
        resourceTransferBytes: performance
          .getEntriesByType('resource')
          .reduce((sum, entry) => sum + entry.transferSize, 0),
      }))
      const clickedAt = Date.now()
      await page.getByRole('button', { name: 'Ask me a question' }).click()
      await page.getByRole('group', { name: 'Choose an answer' }).waitFor({ state: 'visible' })
      samples.push({
        run: run + 1,
        readyMs,
        ...timing,
        firstQuestionObservedMs: Date.now() - clickedAt,
        assetResponses,
      })
    } finally {
      await context.close()
    }
  }
} finally {
  await browser.close()
}
const report = {
  measuredAt: new Date().toISOString(),
  environment:
    'Local Vite production preview, Chromium mobile emulation; response encodings recorded per asset, not hosted field data.',
  conditions: {
    viewport: '390x844',
    latencyMs: 150,
    downloadMbps: 1.6,
    uploadMbps: 0.75,
    cpuSlowdown: 4,
    cache: 'disabled, fresh context per run',
  },
  samples,
}
await mkdir('artifacts', { recursive: true })
await writeFile('artifacts/performance.json', `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
