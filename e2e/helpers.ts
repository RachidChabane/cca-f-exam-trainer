import { type Page } from '@playwright/test'

/**
 * In the active runner, answer every question by selecting option A, advancing
 * with Next until the last question, then submit and confirm. Works for both the
 * 60-question mock and the shorter untimed drills.
 */
export async function answerAllAndSubmit(page: Page): Promise<void> {
  for (let n = 0; n < 80; n++) {
    await page.getByTestId('option-0').click()
    const next = page.getByTestId('next-question')
    if (await next.count()) {
      await next.click()
    } else {
      break // on the last question Next is replaced by the submit button
    }
  }
  await page.getByTestId('submit-exam').click()
  await page.getByTestId('confirm-submit').click()
}
