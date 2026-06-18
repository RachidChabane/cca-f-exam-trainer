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

  // Instant feedback: selecting reveals a correct/incorrect verdict and a
  // rationale for every option, without waiting for the exam to finish.
  await expect(page.getByTestId('answer-feedback')).toBeVisible()
  for (let idx = 0; idx < 4; idx++) {
    await expect(page.getByTestId(`rationale-${idx}`)).toBeVisible()
  }
  // The question locks once answered — options can no longer be changed.
  await expect(page.getByTestId('option-1')).toBeDisabled()

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
