import { expect, test } from '@playwright/test'

test('serves the page metadata, favicon, and sharing image', async ({ page, request }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Ask me a question' })).toBeVisible()
  await expect(page).toHaveTitle('3 A.M. Philosophy — A small question. A long way down.')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /No accounts, no scores, no rush/,
  )
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    '3 A.M. Philosophy',
  )
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  )
  const favicon = await request.get('/favicon.svg')
  expect(favicon.ok()).toBe(true)
  expect(favicon.headers()['content-type']).toContain('image/svg+xml')
  const social = await request.get('/social-card.png')
  expect(social.ok()).toBe(true)
  expect(social.headers()['content-type']).toContain('image/png')
  const png = await social.body()
  expect(png.readUInt32BE(16)).toBe(1200)
  expect(png.readUInt32BE(20)).toBe(630)
})

test('keeps a readable reload option if the initial scripts cannot download', async ({ page }) => {
  await page.route('**/assets/*.js', (route) => route.abort('failed'))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'A thought is on its way.' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Reload and try again' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.unrouteAll()
  await page.getByRole('link', { name: 'Reload and try again' }).click()
  await expect(page.getByRole('button', { name: 'Ask me a question' })).toBeVisible()
})

for (const failure of ['download', 'initialization', 'render'] as const) {
  test(`recovers from an application ${failure} failure with a fresh visit`, async ({ page }) => {
    // Replace the module at the network boundary; no test hooks in production code.
    await page.route('**/assets/App-*.js', async (route) => {
      if (failure === 'download') {
        await route.abort('failed')
      } else {
        await route.fulfill({
          contentType: 'text/javascript',
          body:
            failure === 'render'
              ? 'export default function Broken() { throw new Error("Simulated render failure") }'
              : 'throw new Error("Simulated initialization failure"); export default function App() {}',
        })
      }
    })
    await page.goto('/')
    const heading = page.getByRole('heading', { name: 'A small interruption.' })
    await expect(heading).toBeVisible()
    await expect(heading).toBeFocused()
    await expect(page.getByText('Reloading starts a fresh visit.')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.unrouteAll()
    await page.getByRole('link', { name: 'Reload and begin again' }).click()
    await expect(page.getByRole('button', { name: 'Ask me a question' })).toBeVisible()
  })
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('explains how to open the experience without showing two main regions', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(
      page.getByRole('heading', { name: 'A little curiosity needs JavaScript.' }),
    ).toBeVisible()
    await expect(page.getByRole('main').getByRole('paragraph').last()).toContainText(
      'Your answers stay in this tab.',
    )
    await expect(page.getByRole('link', { name: 'Reload and begin' })).toBeVisible()
  })
})

test('answers, backtracks, pauses, and starts another hole without network requests', async ({
  page,
  context,
}) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Ask me a question' })).toBeVisible()
  await page.waitForLoadState('networkidle')
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await context.setOffline(true)
  await page.getByRole('button', { name: 'Ask me a question' }).click()
  const firstQuestion = await page.getByRole('heading', { level: 1 }).innerText()
  const choices = page.getByRole('group', { name: 'Choose an answer' }).getByRole('button')
  await choices.first().click()
  await page.getByRole('button', { name: 'Go back', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(firstQuestion)
  for (let depth = 0; depth < 8; depth += 1) {
    if (await page.getByRole('heading', { name: 'A place to pause.' }).count()) break
    await choices.last().click()
  }
  await expect(page.getByRole('heading', { name: 'A place to pause.' })).toBeVisible()
  await page.getByRole('button', { name: 'Another rabbit hole', exact: true }).click()
  await expect(choices).toHaveCount(2)
  await page.getByRole('button', { name: 'Leave this thought' }).click()
  await expect(page.getByRole('heading', { name: '3 A.M. Philosophy', exact: true })).toBeVisible()
  expect(requests).toEqual([])
  await context.setOffline(false)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Ask me a question' })).toBeVisible()
})
