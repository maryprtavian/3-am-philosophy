import { expect, test } from '@playwright/test'
import type { Page, TestInfo } from '@playwright/test'
import { content } from '../src/content/library.ts'
import type { ContentNode } from '../src/content/types.ts'
import { expandedJourneys } from './content-cases.ts'

const sizes = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 844, height: 390 },
  { width: 1280, height: 480 },
]

async function openVisit(page: Page, sample = 0): Promise<void> {
  await page.addInitScript((value) => {
    Math.random = () => value
  }, sample)
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Ask me a question' })).toBeVisible()
}

async function reachLongQuestion(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'There would always be more.' }).click()
  await page.getByRole('button', { name: 'I would lose too much of myself.' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'If you could keep living only by letting some memories disappear, would you protect the happiest ones or the ones that explain how you became who you are?',
  )
}

async function reachPause(page: Page): Promise<void> {
  await page
    .getByRole('button', {
      name: 'The happiest ones, even if parts of my story stopped making sense.',
    })
    .click()
  await page
    .getByRole('button', {
      name: 'I would welcome a different version of myself.',
    })
    .click()
  await expect(page.getByRole('heading', { name: 'A place to pause.' })).toBeVisible()
}

async function checkLayout(page: Page): Promise<void> {
  const layout = await page.evaluate(() => {
    const root = document.documentElement
    return {
      width: root.clientWidth,
      documentWidth: root.scrollWidth,
      documentHeight: root.scrollHeight,
      elements: [...document.querySelectorAll<HTMLElement>('main h1, main p, main button')].map(
        (el) => {
          const rect = el.getBoundingClientRect()
          return {
            label: el.textContent,
            left: rect.left,
            right: rect.right,
            top: rect.top + scrollY,
            bottom: rect.bottom + scrollY,
            width: rect.width,
            height: rect.height,
            clientWidth: el.clientWidth,
            scrollWidth: el.scrollWidth,
            clientHeight: el.clientHeight,
            scrollHeight: el.scrollHeight,
            isButton: el.tagName === 'BUTTON',
            isSecondary: Boolean(el.closest('nav')),
          }
        },
      ),
    }
  })

  expect(layout.documentWidth, 'Page should not require horizontal scrolling').toBeLessThanOrEqual(
    layout.width,
  )
  for (const el of layout.elements) {
    expect(el.left, el.label ?? '').toBeGreaterThanOrEqual(0)
    expect(el.right, el.label ?? '').toBeLessThanOrEqual(layout.width + 1)
    expect(el.top, el.label ?? '').toBeGreaterThanOrEqual(0)
    expect(el.bottom, el.label ?? '').toBeLessThanOrEqual(layout.documentHeight + 1)
    expect(el.scrollWidth, `Text clipped horizontally: ${el.label}`).toBeLessThanOrEqual(
      el.clientWidth + 1,
    )
    expect(el.scrollHeight, `Text clipped vertically: ${el.label}`).toBeLessThanOrEqual(
      el.clientHeight + 1,
    )
    if (el.isButton) {
      expect(el.width, el.label ?? '').toBeGreaterThanOrEqual(44)
      expect(el.height, el.label ?? '').toBeGreaterThanOrEqual(el.isSecondary ? 44 : 52)
    }
  }

  // Only leaf blocks are measured, so intersections indicate genuine content/control overlap.
  for (const [index, first] of layout.elements.entries()) {
    for (const second of layout.elements.slice(index + 1)) {
      const overlaps =
        first.left < second.right - 1 &&
        first.right > second.left + 1 &&
        first.top < second.bottom - 1 &&
        first.bottom > second.top + 1
      expect(overlaps, `${first.label} overlaps ${second.label}`).toBe(false)
    }
  }
}

async function checkAnswers(page: Page, stacked: boolean): Promise<void> {
  const boxes = await page
    .getByRole('group', { name: 'Choose an answer' })
    .getByRole('button')
    .evaluateAll((buttons) =>
      buttons.map((button) => {
        const rect = button.getBoundingClientRect()
        return { top: rect.top, bottom: rect.bottom, width: rect.width }
      }),
    )
  expect(boxes).toHaveLength(2)
  const [first, second] = boxes
  if (!first || !second) throw new Error('Expected both answers.')
  expect(
    Math.abs(first.width - second.width),
    'Answers should have equal width',
  ).toBeLessThanOrEqual(1)
  if (stacked) expect(second.top).toBeGreaterThan(first.bottom)
  else expect(Math.abs(first.top - second.top)).toBeLessThanOrEqual(1)
}

async function capture(page: Page, info: TestInfo, name: string): Promise<void> {
  // Review artifacts, not brittle pixel snapshots. Geometry assertions guard the behavior.
  await page.screenshot({ path: info.outputPath(`${name}.png`), fullPage: true })
}

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme })

    for (const collection of expandedJourneys) {
      test(`${collection.entry}: every question and pause fits at 320 pixels`, async ({
        page,
      }, info) => {
        const byId = new Map<string, ContentNode>(content.nodes.map((node) => [node.id, node]))
        const reachable = new Set<string>()
        function collect(id: string): void {
          if (reachable.has(id)) return
          reachable.add(id)
          const node = byId.get(id)
          if (!node) throw new Error(`Missing content: ${id}`)
          if (node.kind === 'question') node.choices.forEach((choice) => collect(choice.next))
        }
        collect(collection.entry)
        const seen = new Set<string>()
        const entryIndex = content.entryPoints.findIndex((id) => id === collection.entry)
        if (entryIndex < 0) throw new Error(`Missing opening: ${collection.entry}`)
        await page.setViewportSize({ width: 320, height: 568 })
        await openVisit(page, (entryIndex + 0.5) / content.entryPoints.length)

        // These three paths cover every distinct node in each new collection.
        // The final set assertion catches coverage gaps when an author changes its branches.
        const paths = [
          [0, 0, 0, 0],
          [0, 1, 1, 0],
          [1, 1, 1, 1],
        ] as const
        for (const [index, path] of paths.entries()) {
          if (index > 0) await page.reload()
          await page.getByRole('button', { name: 'Ask me a question' }).click()
          let id: string = collection.entry
          for (const choice of path) {
            const node = byId.get(id)
            if (node?.kind !== 'question') throw new Error(`Expected a question at ${id}`)
            await expect(page.getByRole('heading', { level: 1 })).toHaveText(node.text)
            seen.add(id)
            await checkLayout(page)
            await checkAnswers(page, true)
            await page
              .getByRole('button', { name: node.choices[choice].label, exact: true })
              .click()
            id = node.choices[choice].next
          }
          expect(byId.get(id)?.kind).toBe('pause')
          seen.add(id)
          await expect(page.getByRole('heading', { name: 'A place to pause.' })).toBeVisible()
          await checkLayout(page)
          if (index === 0) await capture(page, info, 'pause')
          await page.getByRole('button', { name: 'Leave this thought' }).click()
          await expect(page.getByRole('button')).toHaveCount(1)
        }
        expect([...seen].sort()).toEqual([...reachable].sort())
      })
    }

    for (const size of sizes) {
      test(`${size.width}x${size.height}: welcome, short/long questions, pause`, async ({
        page,
      }, info) => {
        await page.setViewportSize(size)
        await openVisit(page)
        await checkLayout(page)
        await capture(page, info, 'welcome')
        await page.getByRole('button', { name: 'Ask me a question' }).click()
        await checkLayout(page)
        await checkAnswers(page, size.width < 640)
        await capture(page, info, 'short-question')
        await reachLongQuestion(page)
        await checkLayout(page)
        await checkAnswers(page, true)
        await capture(page, info, 'long-question')
        await reachPause(page)
        await checkLayout(page)
        await capture(page, info, 'pause')
        // Confirm controls remain reachable when a short viewport requires scrolling.
        await page.getByRole('button', { name: 'Leave this thought' }).click()
        await expect(page.getByRole('button')).toHaveCount(1)
      })
    }

    test('200% text size reflows at 320 pixels', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await openVisit(page)
      // Text-resize stress test; this does not claim to emulate browser zoom or a real device.
      await page.addStyleTag({ content: ':root { font-size: 200%; }' })
      await checkLayout(page)
      await page.getByRole('button', { name: 'Ask me a question' }).click()
      await reachLongQuestion(page)
      await checkLayout(page)
      await checkAnswers(page, true)
      await reachPause(page)
      await checkLayout(page)
      await page.getByRole('button', { name: 'Leave this thought' }).click()
      await expect(page.getByRole('button')).toHaveCount(1)
    })

    test('viewport height changes preserve the route and reachable controls', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await openVisit(page)
      await page.getByRole('button', { name: 'Ask me a question' }).click()
      await reachLongQuestion(page)
      for (const height of [500, 844]) {
        await page.setViewportSize({ width: 390, height })
        await checkLayout(page)
        await expect(page.getByRole('heading', { level: 1 })).toContainText(
          'If you could keep living',
        )
      }
      await reachPause(page)
      await checkLayout(page)
    })

    test('text and control boundaries keep readable contrast', async ({ page }) => {
      await openVisit(page)
      const welcome = await page.evaluate(() => {
        const heading = document.querySelector('h1')
        const description = document.querySelector('#screen-description')
        const primary = document.querySelector('button')
        if (!heading || !description || !primary) throw new Error('Welcome is missing content.')
        return {
          background: getComputedStyle(document.documentElement).backgroundColor,
          heading: getComputedStyle(heading).color,
          muted: getComputedStyle(description).color,
          primaryText: getComputedStyle(primary).color,
          primaryBackground: getComputedStyle(primary).backgroundColor,
        }
      })
      expect(contrast(welcome.heading, welcome.background)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(welcome.muted, welcome.background)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(welcome.primaryText, welcome.primaryBackground)).toBeGreaterThanOrEqual(4.5)
      await page.getByRole('button', { name: 'Ask me a question' }).click()
      const answer = page.getByRole('button', { name: 'Eventually, yes.' })
      const colors = await answer.evaluate((button) => {
        const style = getComputedStyle(button)
        return { text: style.color, background: style.backgroundColor, border: style.borderColor }
      })
      expect(contrast(colors.text, colors.background)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(colors.border, colors.background)).toBeGreaterThanOrEqual(3)
      expect(contrast(colors.border, welcome.background)).toBeGreaterThanOrEqual(3)
    })
  })
}

function contrast(first: string, second: string): number {
  function luminance(color: string): number {
    const components = color
      .match(/[\d.]+/g)
      ?.slice(0, 3)
      .map((value) => {
        const channel = Number(value) / 255
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
      })
    if (!components || components.length !== 3 || !color.startsWith('rgb')) {
      throw new Error(`Expected an opaque RGB color, received ${color}.`)
    }
    const [red = 0, green = 0, blue = 0] = components
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue
  }
  const a = luminance(first)
  const b = luminance(second)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
