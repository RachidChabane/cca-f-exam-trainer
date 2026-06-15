import { test, expect } from '@playwright/test'

test('study: a course self-check quiz gives feedback on a wrong pick', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-study').click()
  await expect(page.getByTestId('course-reader')).toBeVisible()

  // The first course (claude-101) ships an interactive mini-quiz.
  const quiz = page.getByTestId('quiz-item').first()
  await expect(quiz).toBeVisible()

  // Pick option A; the quiz locks in and reveals why the correct answer is right.
  await quiz.getByTestId('quiz-option-0').click()
  await expect(quiz.getByText(/why this is the best answer/i)).toBeVisible()
  await expect(quiz.getByTestId('quiz-retry')).toBeVisible()
})

test('study: the per-theme quiz reveals an explanation after answering', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-study').click()
  await page.getByTestId('study-tab-quiz').click()

  const quiz = page.getByTestId('quiz-item').first()
  await expect(quiz).toBeVisible()
  await quiz.getByTestId('quiz-option-1').click()

  // A score badge appears once at least one answer is given.
  await expect(page.getByTestId('quiz-score').first()).toBeVisible()
})

test('study: exam traps list the trap and the right call', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-study').click()
  await page.getByTestId('study-tab-traps').click()

  await expect(page.getByTestId('trap-item').first()).toBeVisible()
  await expect(page.getByText(/the right call/i).first()).toBeVisible()
})
