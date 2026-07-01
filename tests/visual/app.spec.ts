import { test, expect, type Page } from '@playwright/test'

async function settle(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
}

test('onboarding flow matches baseline', async ({ page }) => {
  await settle(page, '/')
  await expect(page).toHaveScreenshot('onboarding.png', { fullPage: true })
})

test('populated table (demo) matches baseline', async ({ page }) => {
  await settle(page, '/?demo=1')
  await expect(page.locator('table').first()).toBeVisible()
  await expect(page).toHaveScreenshot('table-demo.png', { fullPage: true })
})

test('validation state (banner + invalid rows) matches baseline', async ({ page }) => {
  await settle(page, '/?demo=validation')
  await expect(page.locator('table').first()).toBeVisible()
  await expect(page).toHaveScreenshot('table-validation.png', { fullPage: true })
})
