import { test, expect } from '@playwright/test'

test.describe('home · i18n · theme', () => {
  test('loads with header nav and both mode cards', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('nav-home')).toBeVisible()
    await expect(page.getByTestId('nav-exam')).toBeVisible()
    await expect(page.getByTestId('nav-study')).toBeVisible()
    await expect(page.getByTestId('home-exam-card')).toBeVisible()
    await expect(page.getByTestId('home-study-card')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('language toggle swaps content and persists', async ({ page }) => {
    await page.goto('/')
    const h1 = page.getByRole('heading', { level: 1 })
    const en = (await h1.innerText()).trim()
    expect(en.length).toBeGreaterThan(0)
    await expect(page.getByTestId('lang-en')).toHaveAttribute('aria-pressed', 'true')

    await page.getByTestId('lang-fr').click()
    await expect(page.getByTestId('lang-fr')).toHaveAttribute('aria-pressed', 'true')
    await expect(h1).not.toHaveText(en) // the visible content actually changed

    // language survives a reload (persisted to localStorage)
    await page.reload()
    await expect(page.getByTestId('lang-fr')).toHaveAttribute('aria-pressed', 'true')

    await page.getByTestId('lang-en').click()
    await expect(h1).toHaveText(en)
  })

  test('theme toggle flips light/dark', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).not.toHaveClass(/light/) // default is dark
    await page.getByTestId('theme-toggle').click()
    await expect(html).toHaveClass(/light/)
    await page.getByTestId('theme-toggle').click()
    await expect(html).not.toHaveClass(/light/)
  })
})
