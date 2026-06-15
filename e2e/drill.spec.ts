import { test, expect } from '@playwright/test'
import { answerAllAndSubmit } from './helpers'

test('untimed domain drill → accuracy + retry-wrong', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-exam').click()
  await page.getByTestId('drill-agentic_architecture').click()

  // Drills are untimed (no countdown).
  await expect(page.getByTestId('untimed-badge')).toBeVisible()
  await expect(page.getByTestId('exam-timer')).toHaveCount(0)

  await answerAllAndSubmit(page)

  // Drill results show an accuracy hero (not a scaled score).
  await expect(page.getByTestId('result-accuracy')).toBeVisible()

  // Picking 'A' on ~15 random questions essentially never scores 100%, so the
  // retry-wrong action should be offered; following it re-quizzes the misses.
  await expect(page.getByTestId('retry-wrong')).toBeVisible()
  await page.getByTestId('retry-wrong').click()
  await expect(page.getByTestId('untimed-badge')).toBeVisible()
  await expect(page.getByTestId('option-0')).toBeVisible()
})
