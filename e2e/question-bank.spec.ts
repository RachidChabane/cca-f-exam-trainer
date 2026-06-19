import { test, expect } from '@playwright/test'

/**
 * The imported question bank surfaces as two timed sittings in exam mode —
 * the verbatim "Source bank" and the original "AI-generated bank". Both run
 * through the same runner/results flow as the scenario mock.
 */
test('question bank: official sitting runs start → answer → submit → results', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()

  // Both provenance sittings are offered and enabled (each has 60 questions).
  const official = page.getByTestId('start-bank-official')
  const generated = page.getByTestId('start-bank-generated')
  await expect(official).toBeEnabled()
  await expect(generated).toBeEnabled()

  await official.click()

  // It is a timed sitting, with instant per-option feedback like the mock.
  await expect(page.getByTestId('exam-timer')).toBeVisible()
  await page.getByTestId('option-0').click()
  await expect(page.getByTestId('answer-feedback')).toBeVisible()

  await page.getByTestId('submit-exam').click()
  await page.getByTestId('confirm-submit').click()
  await expect(page.getByTestId('result-scaled')).toBeVisible()
})

test('question bank: content is bilingual (French renders in FR mode)', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('lang-fr').click()
  await page.getByTestId('nav-exam').click()
  await page.getByTestId('start-bank-official').click()

  // The runner is active and shows French content (accents present), not English.
  await expect(page.getByTestId('option-0')).toBeVisible()
  await expect(page.getByTestId('scenario-context')).toContainText(/[éèàçùê]/)
})

test('question bank: AI-generated sitting opens and reviews', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()
  await page.getByTestId('start-bank-generated').click()

  await expect(page.getByTestId('exam-timer')).toBeVisible()
  await page.getByTestId('option-0').click()
  await page.getByTestId('submit-exam').click()
  await page.getByTestId('confirm-submit').click()

  await page.getByTestId('review-answers').click()
  await expect(page.getByTestId('exam-review')).toBeVisible()
})
