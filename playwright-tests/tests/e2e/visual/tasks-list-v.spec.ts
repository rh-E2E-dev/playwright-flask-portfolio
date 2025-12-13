import { test, expect } from '@playwright/test';

test.use({ storageState: '.auth/user12.json' });
test('タスク一覧画面_ビジュアルリグレッション', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL!}/`);
  await expect(page).toHaveScreenshot();
});
