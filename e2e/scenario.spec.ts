import { test, expect } from '@playwright/test'

test('scenario mode assembles a themed, timed block', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()
  await page.getByTestId('start-scenario').click()

  // Scenario mode is timed like the real mock and tags each question with its theme.
  await expect(page.getByTestId('exam-timer')).toBeVisible()
  await expect(page.getByTestId('scenario-tag')).toBeVisible()
})

test('the scenario context stays pinned while you work the set', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()
  await page.getByTestId('start-exam').click()

  // The shared scenario context is shown alongside the question…
  const context = page.getByTestId('scenario-context')
  await expect(context).toBeVisible()
  const firstScenario = await context.locator('h2').innerText()

  // …and stays visible as you advance through the scenario's linked questions.
  await page.getByTestId('option-0').click()
  await page.getByTestId('next-question').click()
  await expect(context).toBeVisible()
  await page.getByTestId('option-0').click()
  await page.getByTestId('next-question').click()
  await expect(context).toBeVisible()

  // The grouped navigator opens and lists scenario blocks.
  await page.getByTestId('open-navigator').click()
  await expect(page.getByText(firstScenario, { exact: false }).first()).toBeVisible()
})
