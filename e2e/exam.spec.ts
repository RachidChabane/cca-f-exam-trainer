import { test, expect } from '@playwright/test'

test('timed mock: start → answer → submit → results → review', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()
  await page.getByTestId('start-exam').click()

  // A timed mock shows the countdown, not the untimed badge.
  await expect(page.getByTestId('exam-timer')).toBeVisible()
  await expect(page.getByTestId('untimed-badge')).toHaveCount(0)

  // Answer the first question.
  await page.getByTestId('option-0').click()
  await expect(page.getByTestId('option-0')).toHaveAttribute('aria-checked', 'true')

  // Submit early via the always-available submit link, then confirm.
  await page.getByTestId('submit-exam').click()
  await page.getByTestId('confirm-submit').click()

  // Results: scaled score + pass/fail verdict.
  await expect(page.getByTestId('result-scaled')).toBeVisible()
  await expect(page.getByTestId('result-verdict')).toBeVisible()

  // Full answer review opens.
  await page.getByTestId('review-answers').click()
  await expect(page.getByTestId('exam-review')).toBeVisible()
})
