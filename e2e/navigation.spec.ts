import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const rootQuestion = 'Would immortality eventually make everything meaningless?'
const fleeting = 'Does a moment matter because it ends, or because you were there?'
const century = 'If you had to forget a century to live another, would you still choose forever?'
const lastEvening =
  'If an evening mattered because it was your last, would knowing that make it better or harder to enjoy?'
const copy = 'Would a perfect copy of you be another you, or someone new?'

async function ready(page: Page, heading?: string): Promise<void> {
  if (heading) await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
  await expect(page.getByRole('button').first()).toBeEnabled()
}

async function open(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Math.random = () => 0
  })
  await page.goto('/')
  await ready(page, '3 A.M. Philosophy')
}

async function enter(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ask me a question' }).click()
  await ready(page, rootQuestion)
}

async function choose(page: Page, label: string, heading?: string): Promise<void> {
  await page.getByRole('button', { name: label, exact: true }).click()
  await ready(page, heading)
}

test('browser and in-app back share history, including replacement of a forward branch', async ({
  page,
}) => {
  await open(page)
  const initialLength = await page.evaluate(() => history.length)
  await enter(page)
  await choose(page, 'Eventually, yes.', fleeting)
  await choose(page, 'Because it ends.', lastEvening)
  await page.goBack()
  await ready(page, fleeting)
  await choose(page, 'Go back', rootQuestion)
  await page.goForward()
  await ready(page, fleeting)
  await choose(page, 'Go back', rootQuestion)
  await choose(page, 'There would always be more.', century)
  await page.goForward()
  await ready(page, century)
  expect(await page.evaluate(() => history.length)).toBe(initialLength + 2)
  await page.goBack()
  await ready(page, rootQuestion)
  await page.goForward()
  await ready(page, century)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
})

test('history restores leaving and another-hole actions without forgetting tried openings', async ({
  page,
}) => {
  await open(page)
  await enter(page)
  await choose(page, 'Eventually, yes.', fleeting)
  await choose(page, 'Leave this thought', '3 A.M. Philosophy')
  await page.goBack()
  await ready(page, fleeting)
  await page.goForward()
  await ready(page, '3 A.M. Philosophy')
  await choose(page, 'Another rabbit hole', copy)
  await choose(page, 'Another me.')
  await choose(page, 'One private moment would be enough.')
  await choose(page, 'The person who had it first.', 'A place to pause.')
  await choose(page, 'Revisit a rabbit hole', rootQuestion)
  // At a new opening, Back returns to the screen that launched it, including a previous pause.
  await choose(page, 'Go back', 'A place to pause.')
  await expect(page.getByRole('button', { name: 'Revisit a rabbit hole' })).toBeVisible()
  await page.goForward()
  await ready(page, rootQuestion)
})

test('refresh invalidates old references and browser Back can still leave the app', async ({
  page,
}) => {
  await page.route('**/before-app.html', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html lang="en"><title>Before the app</title><h1>Before the app</h1><a href="/">Open philosophy</a></html>',
    }),
  )
  await page.addInitScript(() => {
    Math.random = () => 0
  })
  await page.goto('/before-app.html')
  await page.getByRole('link', { name: 'Open philosophy' }).click()
  await ready(page, '3 A.M. Philosophy')
  await enter(page)
  await choose(page, 'Eventually, yes.', fleeting)
  await choose(page, 'Because it ends.', lastEvening)
  await page.goBack()
  await ready(page, fleeting)
  const length = await page.evaluate(() => history.length)
  await page.reload()
  await ready(page, '3 A.M. Philosophy')
  await expect(page.getByRole('button', { name: 'Ask me a question' })).toBeVisible()
  await page.goForward() // An old forward question must not restore answers after refresh.
  await ready(page, '3 A.M. Philosophy')
  for (let step = 0; step < 3; step += 1) {
    await page.goBack()
    await ready(page, '3 A.M. Philosophy')
    await expect(page.getByRole('button')).toHaveCount(1)
  }
  expect(await page.evaluate(() => history.length)).toBe(length)
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Before the app' })).toBeVisible()
  await page.goForward()
  await ready(page, '3 A.M. Philosophy')
})

test('history stores opaque references and no answers or storage records', async ({ page }) => {
  await open(page)
  await enter(page)
  await choose(page, 'Eventually, yes.', fleeting)
  const stored = await page.evaluate(() => {
    const state: unknown = history.state
    return {
      state,
      url: location.pathname + location.search + location.hash,
      local: localStorage.length,
      session: sessionStorage.length,
    }
  })
  expect(stored.state).toMatchObject({ philosophy: { version: 1 } })
  expect(JSON.stringify(stored.state)).not.toMatch(
    /immortality|fleeting|choice|trail|visited|Eventually/,
  )
  expect(stored.url).toBe('/')
  expect(stored.local).toBe(0)
  expect(stored.session).toBe(0)
})

test('rapid activation advances once and native history interrupts the input guard', async ({
  page,
  isMobile,
}) => {
  await open(page)
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  await page.getByRole('button', { name: 'Ask me a question' }).click()
  const firstAnswer = page.getByRole('button', { name: 'Eventually, yes.' })
  await expect(firstAnswer).toBeDisabled()
  await firstAnswer.click({ force: true })
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(rootQuestion)
  await page.clock.runFor(180)
  if (isMobile) {
    await firstAnswer.tap()
    const nextAnswer = page.getByRole('button', { name: 'Because it ends.' })
    const target = await nextAnswer.boundingBox()
    if (!target) throw new Error('The next answer must have a visible touch target.')
    // Direct touch input bypasses the locator's wait for aria-disabled to clear.
    await page.touchscreen.tap(target.x + target.width / 2, target.y + target.height / 2)
  } else {
    await firstAnswer.dblclick({ delay: 20 })
  }
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(fleeting)
  await expect(page.getByRole('button', { name: 'Because it ends.' })).toBeDisabled()
  await page.goBack() // Browser navigation is not blocked by the app's guard.
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(rootQuestion)
  await page.clock.runFor(180)
  await ready(page, rootQuestion)
  // A later second click in a multi-click sequence is also ignored after the timer expires.
  const target = await firstAnswer.boundingBox()
  if (!target) throw new Error('The first answer must have a visible click target.')
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2)
  await page.mouse.down({ clickCount: 2 })
  await page.mouse.up({ clickCount: 2 })
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(rootQuestion)
  await page.goForward()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(fleeting)
  await page.clock.runFor(180)
  await ready(page, fleeting)
})

test('holding Enter or Space cannot answer several questions', async ({ page }) => {
  await open(page)
  await enter(page)
  await page.keyboard.press('Tab')
  await page.keyboard.down('Enter')
  await ready(page, fleeting)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Because it ends.' })).toBeFocused()
  await page.keyboard.down('Enter') // Repeated keydown while the same physical key is still held.
  await page.keyboard.up('Enter')
  await ready(page, fleeting)
  await page.keyboard.press('Enter')
  await ready(page, lastEvening)
  await page.keyboard.press('Tab')
  await page.keyboard.down('Space')
  await page.keyboard.down('Space')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(lastEvening)
  await page.keyboard.up('Space')
  await ready(page, 'Would you choose a thousand ordinary Tuesdays over one extraordinary night?')
})

test('back and forward restore reading focus at the top of long content', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await open(page)
  await enter(page)
  await choose(page, 'There would always be more.', century)
  await choose(page, 'I would lose too much of myself.')
  const longQuestion = await page.getByRole('heading', { level: 1 }).innerText()
  await page.getByRole('button', { name: 'Leave this thought' }).scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0)
  await page.goBack()
  await ready(page, century)
  await page.goForward()
  await ready(page, longQuestion)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  expect(await page.evaluate(() => scrollY)).toBe(0)
  await choose(page, 'Go back', century)
  expect(await page.evaluate(() => scrollY)).toBe(0)
})

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`focus moves once per navigation with motion preference ${reducedMotion}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion })
    await page.addInitScript(() => {
      const state = window as typeof window & { headingFocusLog: string[] }
      state.headingFocusLog = []
      document.addEventListener('focusin', (event) => {
        if (event.target instanceof HTMLHeadingElement && event.target.id === 'screen-title') {
          state.headingFocusLog.push(event.target.textContent ?? '')
        }
      })
    })
    await open(page)
    await enter(page)
    const heading = page.getByRole('heading', { level: 1 })
    if (reducedMotion === 'reduce') await expect(heading).toHaveCSS('animation-name', 'none')
    else {
      await expect(heading).not.toHaveCSS('animation-name', 'none')
      await expect(heading).toHaveCSS('animation-duration', '0.18s')
    }
    await choose(page, 'Eventually, yes.', fleeting)
    await choose(page, 'Go back', rootQuestion)
    await page.goForward()
    await ready(page, fleeting)
    const focused = await page.evaluate(
      () => (window as typeof window & { headingFocusLog: string[] }).headingFocusLog,
    )
    expect(focused).toEqual([rootQuestion, fleeting, rootQuestion, fleeting])
    await expect(page.locator('[aria-live]')).toHaveCount(0)
  })
}
