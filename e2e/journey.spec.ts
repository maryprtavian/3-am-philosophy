import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const immortality = 'Would immortality eventually make everything meaningless?'
const perfectCopy = 'Would a perfect copy of you be another you, or someone new?'
const fleeting = 'Does a moment matter because it ends, or because you were there?'
const anotherCentury =
  'If you had to forget a century to live another, would you still choose forever?'

async function openVisit(page: Page, sample = 0): Promise<void> {
  // Control entry selection in the isolated test context, without adding hooks to the app.
  await page.addInitScript((value) => {
    Math.random = () => value
  }, sample)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('3 A.M. Philosophy')
  await expect(page.getByRole('button')).toHaveCount(1)
}

async function expectQuestion(page: Page, text: string): Promise<void> {
  const heading = page.getByRole('heading', { level: 1, name: text, exact: true })
  await expect(heading).toBeVisible()
  await expect(heading).toBeFocused()
  await expect(
    page.getByRole('group', { name: 'Choose an answer' }).getByRole('button').first(),
  ).toBeEnabled()
  await expect(
    page.getByRole('group', { name: 'Choose an answer' }).getByRole('button'),
  ).toHaveCount(2)
}

async function choose(page: Page, label: string, next: string): Promise<void> {
  await page.getByRole('button', { name: label, exact: true }).click()
  await expectQuestion(page, next)
}

test('completes both rabbit holes, reports revisits, and leaves with one opening control', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await openVisit(page)
  await page.getByRole('button', { name: 'Ask me a question' }).click()
  await expectQuestion(page, immortality)
  await choose(page, 'Eventually, yes.', fleeting)
  await choose(
    page,
    'Because it ends.',
    'If an evening mattered because it was your last, would knowing that make it better or harder to enjoy?',
  )
  await choose(
    page,
    'I would notice everything more.',
    'Would you choose a thousand ordinary Tuesdays over one extraordinary night?',
  )
  await choose(
    page,
    'Give me the Tuesdays.',
    'If one ordinary day could repeat forever, would you want to know it was repeating?',
  )
  await page.getByRole('button', { name: 'Knowing would make each return feel different.' }).click()
  await expect(page.getByRole('heading', { name: 'A place to pause.' })).toBeFocused()
  await expect(page.getByText('Forever can wait a moment.', { exact: false })).toBeVisible()
  await expect(page.getByRole('group', { name: 'Choose an answer' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Another rabbit hole', exact: true }).click()
  await expectQuestion(page, perfectCopy)
  await choose(
    page,
    'Another me.',
    'Would one different memory be enough to turn your copy into someone else?',
  )
  await choose(
    page,
    'One private moment would be enough.',
    'If you and your copy wanted the same name, would either of you have a stronger claim?',
  )
  await page.getByRole('button', { name: 'The person who had it first.' }).click()
  await expect(page.getByRole('heading', { name: 'A place to pause.' })).toBeFocused()
  await expect(page.getByText('You’ve tried every opening.', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Another rabbit hole', exact: true })).toHaveCount(
    0,
  )
  await page.getByRole('button', { name: 'Revisit a rabbit hole', exact: true }).click()
  await expectQuestion(page, immortality)
  await page.getByRole('button', { name: 'Leave this thought' }).click()
  await expect(page.getByRole('heading', { name: '3 A.M. Philosophy', exact: true })).toBeFocused()
  await expect(page.getByRole('button')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Revisit a rabbit hole' })).toBeVisible()
  await expect(page).toHaveURL('/')
  expect(errors).toEqual([])
})

test('changes an earlier answer, leaves, and starts a fresh visit on reload', async ({ page }) => {
  await openVisit(page)
  await page.getByRole('button', { name: 'Ask me a question' }).click()
  await choose(page, 'Eventually, yes.', fleeting)
  await page.getByRole('button', { name: 'Go back', exact: true }).click()
  await expectQuestion(page, immortality)
  await choose(page, 'There would always be more.', anotherCentury)
  await choose(
    page,
    'I would lose too much of myself.',
    'If you could keep living only by letting some memories disappear, would you protect the happiest ones or the ones that explain how you became who you are?',
  )
  await page.getByRole('button', { name: 'Leave this thought' }).click()
  await expect(page.getByRole('button')).toHaveCount(1)
  await page.getByRole('button', { name: 'Another rabbit hole', exact: true }).click()
  await expectQuestion(page, perfectCopy)
  await page.reload()
  await expect(page.getByRole('button')).toHaveCount(1)
  await page.getByRole('button', { name: 'Ask me a question' }).click()
  await expectQuestion(page, immortality)
})

test('supports a keyboard journey with visible focus and a useful tab order', async ({ page }) => {
  await openVisit(page)
  await page.keyboard.press('Tab')
  const opening = page.getByRole('button', { name: 'Ask me a question' })
  await expect(opening).toBeFocused()
  await expect(opening).toHaveCSS('outline-style', 'solid')
  await expect(opening).toHaveCSS('outline-width', '3px')
  await page.keyboard.press('Enter')
  await expectQuestion(page, immortality)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Eventually, yes.' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'There would always be more.' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expectQuestion(page, anotherCentury)

  for (const next of [
    "If you woke with someone else's memories, which life would feel more like yours?",
    'Would you keep a promise made by a version of you whose memories you no longer had?',
  ]) {
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expectQuestion(page, next)
  }
  await page.keyboard.press('Tab')
  await page.keyboard.press('Space')
  await expect(page.getByRole('heading', { name: 'A place to pause.' })).toBeFocused()
  await expect(
    page.getByRole('heading', { name: 'A place to pause.' }),
  ).toHaveAccessibleDescription(
    'Would you keep a promise made by a version of you whose memories you no longer had? The question can stay open. Sit with it a little longer, or follow another rabbit hole.',
  )
  await expect(page.getByRole('button', { name: 'Another rabbit hole', exact: true })).toBeEnabled()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Another rabbit hole', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await expectQuestion(page, perfectCopy)
})

test('can start with the second opening and go back from a pause and the root', async ({
  page,
}) => {
  await openVisit(page, 0.75)
  await page.getByRole('button', { name: 'Ask me a question' }).click()
  await expectQuestion(page, perfectCopy)
  await choose(
    page,
    'Someone new.',
    'Would your copy inherit your friendships, or have to begin them again?',
  )
  const sharedName =
    'If you and your copy wanted the same name, would either of you have a stronger claim?'
  await choose(page, 'They would need to build their own.', sharedName)
  await page.getByRole('button', { name: 'We would have an equal claim.' }).click()
  await expect(page.getByRole('heading', { name: 'A place to pause.' })).toBeFocused()
  await page.getByRole('button', { name: 'Go back', exact: true }).click()
  await expectQuestion(page, sharedName)
  await page.getByRole('button', { name: 'Go back', exact: true }).click()
  await page.getByRole('button', { name: 'Go back', exact: true }).click()
  await expectQuestion(page, perfectCopy)
  await page.getByRole('button', { name: 'Go back', exact: true }).click()
  await expect(page.getByRole('heading', { name: '3 A.M. Philosophy', exact: true })).toBeFocused()
  await expect(page.getByRole('button')).toHaveCount(1)
  await page.getByRole('button', { name: 'Another rabbit hole', exact: true }).click()
  await expectQuestion(page, immortality)
})

test('a shared pause keeps the actual last question when a branch changes or history returns', async ({
  page,
}) => {
  const friendship = 'Would your copy inherit your friendships, or have to begin them again?'
  const sharedName =
    'If you and your copy wanted the same name, would either of you have a stronger claim?'
  const sharedPromise =
    'If your copy remembered making one of your promises, would they have to keep it?'
  const invitation =
    'Your copy can wait here too. Stay with this question, or follow another rabbit hole.'
  const pause = page.getByRole('heading', { name: 'A place to pause.', exact: true })
  await openVisit(page, 0.75)
  await page.getByRole('button', { name: 'Ask me a question' }).click()
  await choose(page, 'Someone new.', friendship)
  await choose(page, 'They would need to build their own.', sharedName)
  await page.getByRole('button', { name: 'We would have an equal claim.' }).click()
  await expect(pause).toBeFocused()
  await expect(page.getByText(sharedName, { exact: true })).toBeVisible()
  await expect(pause).toHaveAccessibleDescription(`${sharedName} ${invitation}`)
  await expect(page.getByRole('button')).toHaveCount(3)

  await page.getByRole('button', { name: 'Go back', exact: true }).click()
  await page.getByRole('button', { name: 'Go back', exact: true }).click()
  await expectQuestion(page, friendship)
  await choose(page, 'Those bonds would belong to both of us.', sharedPromise)
  await page.getByRole('button', { name: 'They would need to agree to it themselves.' }).click()
  await expect(pause).toBeFocused()
  await expect(page.getByText(sharedPromise, { exact: true })).toBeVisible()
  await expect(page.getByText(sharedName, { exact: true })).toHaveCount(0)
  await expect(pause).toHaveAccessibleDescription(`${sharedPromise} ${invitation}`)

  await page.getByRole('button', { name: 'Another rabbit hole', exact: true }).click()
  await expectQuestion(page, immortality)
  await expect(page.getByText(sharedPromise, { exact: true })).toHaveCount(0)
  await page.goBack()
  await expect(pause).toBeFocused()
  await expect(pause).toHaveAccessibleDescription(`${sharedPromise} ${invitation}`)
  await page.goBack()
  await expectQuestion(page, sharedPromise)
  await page.goForward()
  await expect(pause).toBeFocused()
  await expect(page.getByText(sharedPromise, { exact: true })).toBeVisible()
  await expect(pause).toHaveAccessibleDescription(`${sharedPromise} ${invitation}`)
})
