import { test, expect } from '@playwright/test'

test('an in-progress timed mock survives a reload', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()
  await page.getByTestId('start-exam').click()
  await page.getByTestId('option-0').click()
  await expect(page.getByTestId('option-0')).toHaveAttribute('aria-checked', 'true')

  await page.reload() // store rehydrates from localStorage

  // Dropped back into the same timed runner with the answer preserved.
  await expect(page.getByTestId('exam-timer')).toBeVisible()
  await expect(page.getByTestId('option-0')).toHaveAttribute('aria-checked', 'true')
})

test('home offers a resume banner while an exam is active', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()
  await page.getByTestId('start-exam').click()
  await page.getByTestId('option-0').click()

  await page.getByTestId('nav-home').click()
  await expect(page.getByTestId('resume-exam')).toBeVisible()
  await page.getByTestId('resume-exam').click()
  await expect(page.getByTestId('exam-timer')).toBeVisible()
})
