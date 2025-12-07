import { test, expect } from '@playwright/test';

// TODO: 要素を変数に切り分ける？

test.describe('ログイン', () => {
  test('表示', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL!}/login`);
    await expect(page.getByRole('heading', { name: 'ログイン' })).toHaveText('ログイン');
    await expect(page.getByRole('textbox', { name: 'ユーザー名' })).toBeEmpty();
    await expect(page.getByRole('textbox', { name: 'パスワード' })).toBeEmpty();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeEnabled();
  });
  test.describe('正常系', () => {
    test('ログインする', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/login`);
      await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER1_NAME!);
      await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER1_PASSWORD!);
      await page.getByRole('button', { name: 'ログイン' }).click();
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);
    });
    test.describe('異常系', () => {
      test.describe('未入力', () => {
        test('ユーザー名、パスワード共に未入力', async ({ page }) => {
          await page.goto(`${process.env.BASE_URL!}/login`);
          await page.getByRole('button', { name: 'ログイン' }).click();
          await expect(page.getByText(/ユーザー名とパスワードを入力してください/)).toBeVisible();
        });
        test('ユーザー名のみ未入力', async ({ page }) => {
          await page.goto(`${process.env.BASE_URL!}/login`);
          await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER1_PASSWORD!);
          await page.getByRole('button', { name: 'ログイン' }).click();
          await expect(page.getByText(/ユーザー名とパスワードを入力してください/)).toBeVisible();
        });
        test('パスワードのみ未入力', async ({ page }) => {
          await page.goto(`${process.env.BASE_URL!}/login`);
          await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER1_NAME!);
          await page.getByRole('button', { name: 'ログイン' }).click();
          await expect(page.getByText(/ユーザー名とパスワードを入力してください/)).toBeVisible();
        });
      });
      test.describe('不正', () => {
        test('ユーザー名、パスワード共に不正', async ({ page }) => {
          await page.goto(`${process.env.BASE_URL!}/login`);
          await page
            .getByRole('textbox', { name: 'ユーザー名' })
            .fill(`${process.env.USER1_NAME!}wrong`);
          await page
            .getByRole('textbox', { name: 'パスワード' })
            .fill(`${process.env.USER1_PASSWORD!}wrong`);
          await page.getByRole('button', { name: 'ログイン' }).click();
          await expect(page.getByText(/ログインに失敗しました/)).toBeVisible();
        });
        test('ユーザー名のみ不正', async ({ page }) => {
          await page.goto(`${process.env.BASE_URL!}/login`);
          await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER2_NAME!);
          await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER1_PASSWORD!);
          await page.getByRole('button', { name: 'ログイン' }).click();
          await expect(page.getByText(/ログインに失敗しました/)).toBeVisible();
        });
        test('パスワードのみ不正', async ({ page }) => {
          await page.goto(`${process.env.BASE_URL!}/login`);
          await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER1_NAME!);
          await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER2_PASSWORD!);
          await page.getByRole('button', { name: 'ログイン' }).click();
          await expect(page.getByText(/ログインに失敗しました/)).toBeVisible();
        });
      });
    });
  });
});
