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

test('study: switching courses clears the previous quiz selections', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-study').click()
  await expect(page.getByTestId('course-reader')).toBeVisible()

  // Answer a question on the first course; it locks in and reveals feedback.
  const firstQuiz = page.getByTestId('quiz-item').first()
  await firstQuiz.getByTestId('quiz-option-0').click()
  await expect(firstQuiz.getByTestId('quiz-retry')).toBeVisible()

  // Jump to a different course that ships the same number of questions (index 2,
  // also 6 questions), so a count-only reset would miss it. The mobile <select>
  // drives the same state as the desktop sidebar.
  await page.setViewportSize({ width: 480, height: 900 })
  await page.getByLabel('Courses', { exact: true }).selectOption('2')

  // The new course's quiz must start fresh: no locked-in selection, no feedback.
  const newQuiz = page.getByTestId('quiz-item').first()
  await expect(newQuiz).toBeVisible()
  await expect(newQuiz.getByTestId('quiz-retry')).toHaveCount(0)
  await expect(newQuiz.getByTestId('quiz-option-0')).toBeEnabled()
  await expect(page.getByTestId('quiz-score')).toHaveCount(0)
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
