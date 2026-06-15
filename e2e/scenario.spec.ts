import { test, expect } from '@playwright/test'

test('scenario mode assembles a themed, timed block', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()
  await page.getByTestId('start-scenario').click()

  // Scenario mode is timed like the real mock and tags each question with its theme.
  await expect(page.getByTestId('exam-timer')).toBeVisible()
  await expect(page.getByTestId('scenario-tag')).toBeVisible()
})
