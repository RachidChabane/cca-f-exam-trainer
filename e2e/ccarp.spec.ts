import { test, expect, type Page } from '@playwright/test'

/**
 * CCA-P (CCAR-P) sittings. This exam differs from CCA-F in the ways that matter to
 * the runner: 63 standalone items (no shared scenario context), seven different
 * domains, and — the part with real logic behind it — multiple-response and
 * scenario-matching items, which only lock once the answer is COMPLETE.
 */

async function startCcarp(page: Page) {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()
  const official = page.getByTestId('start-ccarp-official')
  await expect(official).toBeEnabled()
  await official.click()
  await expect(page.getByTestId('exam-timer')).toBeVisible()
}

/** Walk forward until the current question matches `probe`, or give up. */
async function advanceUntil(page: Page, probe: () => Promise<boolean>, max = 63) {
  for (let n = 0; n < max; n++) {
    if (await probe()) return true
    const next = page.getByTestId('next-question')
    if (!(await next.count())) return false
    await next.click()
  }
  return false
}

test('ccarp: sitting is timed, 63 items, and carries no scenario panel', async ({ page }) => {
  await startCcarp(page)

  // CCA-P items are standalone — the scenario context panel must not render.
  await expect(page.getByTestId('scenario-context')).toHaveCount(0)

  // 63 items at blueprint weights.
  await expect(page.getByTestId('question-counter')).toContainText('63')
})

test('ccarp: a multiple-response item locks only when the required count is picked', async ({
  page,
}) => {
  await startCcarp(page)

  const found = await advanceUntil(page, async () => (await page.getByTestId('mr-hint').count()) > 0)
  expect(found, 'expected at least one multiple-response item in a 63-item sitting').toBe(true)

  const hint = page.getByTestId('mr-hint')
  await expect(hint).toContainText('TWO')

  // One pick is not a complete answer: nothing is revealed, and the option is
  // still live so the candidate can change their mind.
  await page.getByTestId('option-0').click()
  await expect(page.getByTestId('answer-feedback')).toHaveCount(0)
  await expect(hint).toContainText('1 more to pick')

  // Toggling the same option off is allowed while still incomplete.
  await page.getByTestId('option-0').click()
  await expect(hint).not.toContainText('1 more to pick')

  // Two picks completes it → reveals and locks.
  await page.getByTestId('option-0').click()
  await page.getByTestId('option-1').click()
  await expect(page.getByTestId('answer-feedback')).toBeVisible()
  await expect(page.getByTestId('option-2')).toBeDisabled()
})

test('ccarp: a matching item locks only when every row is classified', async ({ page }) => {
  await startCcarp(page)

  const found = await advanceUntil(
    page,
    async () => (await page.getByTestId('matching-grid').count()) > 0,
  )
  expect(found, 'expected at least one matching item in a 63-item sitting').toBe(true)

  const rows = page.locator('[data-testid^="matching-row-"]')
  const rowCount = await rows.count()
  expect(rowCount).toBeGreaterThan(1)

  // Classifying some-but-not-all rows reveals nothing.
  await page.getByTestId('matching-0-0').click()
  await expect(page.getByTestId('answer-feedback')).toHaveCount(0)

  // An option may key more than one row — the same choice stays selectable.
  for (let r = 1; r < rowCount; r++) {
    await page.getByTestId(`matching-${r}-0`).click()
  }
  await expect(page.getByTestId('answer-feedback')).toBeVisible()
  await expect(page.getByTestId('matching-0-1')).toBeDisabled()
})

test('ccarp: multiple-response is graded all-or-nothing', async ({ page }) => {
  await startCcarp(page)

  const found = await advanceUntil(page, async () => (await page.getByTestId('mr-hint').count()) > 0)
  expect(found).toBe(true)

  // Pick the first two options. Whatever the key is, the verdict must agree with
  // the per-option marks: "correct" only if BOTH picks are keyed and nothing is
  // missing. This asserts the all-or-nothing rule without hard-coding an answer.
  await page.getByTestId('option-0').click()
  await page.getByTestId('option-1').click()

  const feedback = page.getByTestId('answer-feedback')
  await expect(feedback).toBeVisible()

  const optionCount = await page.locator('[data-testid^="option-"]').count()
  let keyed = 0
  for (let i = 0; i < optionCount; i++) {
    const cls = (await page.getByTestId(`option-${i}`).getAttribute('class')) ?? ''
    if (cls.includes('border-success')) keyed++
  }
  // Exactly two options are keyed on a "select TWO" item.
  expect(keyed).toBe(2)

  const firstTwoCls = await Promise.all(
    [0, 1].map(async (i) => (await page.getByTestId(`option-${i}`).getAttribute('class')) ?? ''),
  )
  const bothPicksKeyed = firstTwoCls.every((c) => c.includes('border-success'))
  const verdict = (await feedback.textContent()) ?? ''
  // Correct iff both of our picks were the keyed pair — no partial credit.
  expect(/correct/i.test(verdict) && !/incorrect/i.test(verdict)).toBe(bothPicksKeyed)
})
