import { test, expect } from '@playwright/test';

test.use({ storageState: '.auth/user12.json' });
test('マイページ_ビジュアルリグレッション', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL!}/mypage`);
  await expect(page).toHaveScreenshot();
});
