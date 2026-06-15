import { test, expect } from '@playwright/test'

test.describe('about page', () => {
  test('explains the format, mirrors it, and cites sources', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-about').click()

    // Page renders with its heading and the in-page table of contents.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const toc = page.getByRole('navigation', { name: /on this page/i })
    await expect(toc).toBeVisible()

    // The key sections are present.
    await expect(page.locator('#scenario-questions')).toBeVisible()
    await expect(page.locator('#how-we-mirror')).toBeVisible()
    await expect(page.locator('#confirmed-inferred')).toBeVisible()

    // Sources are real external links (first-party + community).
    const anthropic = page.getByRole('link', { name: /Claude Partner Network/i })
    await expect(anthropic).toHaveAttribute('href', /anthropic\.com/)
  })

  test('table of contents anchors jump to a section', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-about').click()
    await page.getByRole('link', { name: /scenario connects to its questions/i }).click()
    await expect(page).toHaveURL(/#scenario-questions$/)
    await expect(page.locator('#scenario-questions')).toBeInViewport()
  })

  test('reachable from the footer too', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('footer-about').click()
    await expect(page.locator('#how-we-mirror')).toBeVisible()
  })
})
