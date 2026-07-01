import { test, expect } from '@playwright/test'

test.describe('Decisioning Table App', () => {
  test('loads and matches snapshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('app-initial.png')
  })

  test('table renders with expected structure', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check for table element
    const table = await page.locator('table')
    await expect(table).toBeVisible()

    // Take snapshot of table
    await expect(table).toHaveScreenshot('table-structure.png')
  })
})
