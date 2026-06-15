import { test, expect } from '@playwright/test'

test('study: open a course and reveal a check answer', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('nav-study').click()

  await expect(page.getByTestId('course-reader')).toBeVisible()

  // The first self-check answer starts collapsed (disclosure closed)…
  const reveal = page.getByTestId('reveal-answer').first()
  await expect(reveal).toHaveAttribute('aria-expanded', 'false')

  // …and opens on click, surfacing the answer text.
  await reveal.click()
  await expect(reveal).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByTestId('check-answer').first()).toBeVisible()
})
