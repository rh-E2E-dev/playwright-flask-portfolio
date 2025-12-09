import { test as setup, expect } from '@playwright/test';

setup('ログイン認証保持：ユーザー1', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL!}/login`);
  await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER1_NAME!);
  await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER1_PASSWORD!);
  await page.getByRole('button', { name: 'ログイン' }).click();

  await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);

  await page.context().storageState({ path: '.auth/user1.json' });
});

setup('ログイン認証保持：ユーザー2', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL!}/login`);
  await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER2_NAME!);
  await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER2_PASSWORD!);
  await page.getByRole('button', { name: 'ログイン' }).click();

  await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);

  await page.context().storageState({ path: '.auth/user2.json' });
});

setup('ログイン認証保持：ユーザー3', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL!}/login`);
  await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER3_NAME!);
  await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER3_PASSWORD!);
  await page.getByRole('button', { name: 'ログイン' }).click();

  await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);

  await page.context().storageState({ path: '.auth/user3.json' });
});

setup('ログイン認証保持：ユーザー4', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL!}/login`);
  await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER4_NAME!);
  await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER4_PASSWORD!);
  await page.getByRole('button', { name: 'ログイン' }).click();

  await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);

  await page.context().storageState({ path: '.auth/user4.json' });
});

setup('ログイン認証保持：ユーザー5', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL!}/login`);
  await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER5_NAME!);
  await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER5_PASSWORD!);
  await page.getByRole('button', { name: 'ログイン' }).click();

  await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);

  await page.context().storageState({ path: '.auth/user5.json' });
});
