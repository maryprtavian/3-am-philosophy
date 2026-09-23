import { readFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const browser = await chromium.launch()
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })
  const svg = await readFile(new URL('./social-card.svg', import.meta.url), 'utf8')
  await page.setContent(`<style>html,body{margin:0}svg{display:block}</style>${svg}`)
  await page.screenshot({ path: 'public/social-card.png' })
} finally {
  await browser.close()
}
