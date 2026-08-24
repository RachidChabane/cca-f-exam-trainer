import { test, expect } from '@playwright/test'

/**
 * The CCA-P rote panel under Study: non-inferable facts as structured rows,
 * with search, traps-only, and a recall (hide-and-reveal) mode.
 */

test('rote: the study CCA-P tab renders items, filters by search, and recall hides facts', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByTestId('nav-study').click()
  await page.getByTestId('study-tab-ccap').click()

  // Items render with their atomic points.
  await expect(page.getByText('Seven platform primitives')).toBeVisible()

  // Search narrows the list to matching items only.
  await page.getByTestId('rote-search').fill('budget_tokens')
  await expect(page.getByText('budget_tokens removal')).toBeVisible()
  await expect(page.getByText('Seven platform primitives')).toHaveCount(0)
  await page.getByTestId('rote-search').fill('')

  // Traps-only keeps counterintuitive items and drops must-know ones.
  await page.getByTestId('rote-traps').click()
  await expect(page.getByText('Guardrails must fail closed')).toBeVisible()
  await expect(page.getByText('Seven platform primitives')).toHaveCount(0)
  await page.getByTestId('rote-traps').click()

  // Recall mode announces itself; a click on an entry reveals it.
  await page.getByTestId('rote-recall').click()
  await expect(page.getByText(/click a card to reveal/i)).toBeVisible()
})
