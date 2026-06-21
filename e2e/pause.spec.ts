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

test('untimed drills have no pause control', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()
  await page.getByTestId('drill-agentic_architecture').click()
  await expect(page.getByTestId('untimed-badge')).toBeVisible()
  await expect(page.getByTestId('pause-exam')).toHaveCount(0)
})
