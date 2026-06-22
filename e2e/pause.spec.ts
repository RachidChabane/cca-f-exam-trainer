import { test, expect } from '@playwright/test'

/** Pausing is available in every timed exam type: it stops the countdown and
 * hides the question behind a Paused panel until you resume. */
test('full mock: pause hides the question and resume restores it', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()
  await page.getByTestId('start-exam').click()

  await expect(page.getByTestId('exam-timer')).toBeVisible()
  await expect(page.getByTestId('option-0')).toBeVisible()

  // Pause → question hidden, paused panel shown.
  await page.getByTestId('pause-exam').click()
  await expect(page.getByTestId('paused-overlay')).toBeVisible()
  await expect(page.getByTestId('option-0')).toHaveCount(0)

  // Resume → back to the question.
  await page.getByTestId('resume-paused').click()
  await expect(page.getByTestId('paused-overlay')).toHaveCount(0)
  await expect(page.getByTestId('option-0')).toBeVisible()
})

test('a paused exam survives a reload and stays paused', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()
  await page.getByTestId('start-exam').click()
  await page.getByTestId('pause-exam').click()
  await expect(page.getByTestId('paused-overlay')).toBeVisible()

  await page.reload()
  // Still paused after a refresh (persisted), not silently resumed.
  await expect(page.getByTestId('paused-overlay')).toBeVisible()
  await expect(page.getByTestId('option-0')).toHaveCount(0)
  await page.getByTestId('resume-paused').click()
  await expect(page.getByTestId('option-0')).toBeVisible()
})

test('question-bank sitting can also be paused', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()
  await page.getByTestId('start-bank-official').click()
  await expect(page.getByTestId('exam-timer')).toBeVisible()
  await page.getByTestId('pause-exam').click()
  await expect(page.getByTestId('paused-overlay')).toBeVisible()
  await page.getByTestId('resume-paused').click()
  await expect(page.getByTestId('option-0')).toBeVisible()
})

test('selecting an answer auto-pauses the timer for reading, resumes on next', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()
  await page.getByTestId('start-exam').click()

  const timer = page.getByTestId('exam-timer')
  await expect(timer).toBeVisible()

  // Answer → explanations reveal, question stays visible (no overlay), timer freezes.
  await page.getByTestId('option-0').click()
  await expect(page.getByTestId('answer-feedback')).toBeVisible()
  await expect(page.getByTestId('paused-overlay')).toHaveCount(0)
  await expect(page.getByTestId('reading-paused-hint')).toBeVisible()

  // The countdown is genuinely frozen: value unchanged after 2s.
  const frozen = await timer.textContent()
  await page.waitForTimeout(2000)
  expect(await timer.textContent()).toBe(frozen)

  // Moving to the next (unanswered) question resumes the clock.
  await page.getByTestId('next-question').click()
  await expect(page.getByTestId('reading-paused-hint')).toHaveCount(0)
  const resumed = await timer.textContent()
  await page.waitForTimeout(1500)
  expect(await timer.textContent()).not.toBe(resumed)
})

test('untimed drills have no pause control', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()
  await page.getByTestId('drill-agentic_architecture').click()
  await expect(page.getByTestId('untimed-badge')).toBeVisible()
  await expect(page.getByTestId('pause-exam')).toHaveCount(0)
})
