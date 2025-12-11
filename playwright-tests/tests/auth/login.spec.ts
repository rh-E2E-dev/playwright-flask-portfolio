import { test, expect } from '@playwright/test';

test.describe('ログイン', () => {
  test('基本要素が表示されていること', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL!}/login`);
    await expect(page.getByRole('heading', { name: 'ログイン' })).toHaveText('ログイン');
    await expect(page.getByRole('textbox', { name: 'ユーザー名' })).toBeEmpty();
    await expect(page.getByRole('textbox', { name: 'パスワード' })).toBeEmpty();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeEnabled();
  });
  test.describe('動作（正常系）', () => {
    test('ログインできること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/login`);
      await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER1_NAME!);
      await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER1_PASSWORD!);
      await page.getByRole('button', { name: 'ログイン' }).click();
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);
    });
  });
  test.describe('動作（異常系）', () => {
    test.describe('未入力', () => {
      test('ユーザー名、パスワード共に未入力で未入力エラーが表示されること', async ({ page }) => {
        await page.goto(`${process.env.BASE_URL!}/login`);
        await page.getByRole('button', { name: 'ログイン' }).click();
        await expect(page.getByText(/ユーザー名とパスワードを入力してください/)).toBeVisible();
      });
      test('ユーザー名のみ未入力で未入力エラーが表示されること', async ({ page }) => {
        await page.goto(`${process.env.BASE_URL!}/login`);
        await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER1_PASSWORD!);
        await page.getByRole('button', { name: 'ログイン' }).click();
        await expect(page.getByText(/ユーザー名とパスワードを入力してください/)).toBeVisible();
      });
      test('パスワードのみ未入力で未入力エラーが表示されること', async ({ page }) => {
        await page.goto(`${process.env.BASE_URL!}/login`);
        await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER1_NAME!);
        await page.getByRole('button', { name: 'ログイン' }).click();
        await expect(page.getByText(/ユーザー名とパスワードを入力してください/)).toBeVisible();
      });
    });
    test.describe('不正', () => {
      test('ユーザー名、パスワード共に不正でログインエラーが表示されること', async ({ page }) => {
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
      test('ユーザー名のみ不正でログインエラーが表示されること', async ({ page }) => {
        await page.goto(`${process.env.BASE_URL!}/login`);
        await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER2_NAME!);
        await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER1_PASSWORD!);
        await page.getByRole('button', { name: 'ログイン' }).click();
        await expect(page.getByText(/ログインに失敗しました/)).toBeVisible();
      });
      test('パスワードのみ不正でログインエラーが表示されること', async ({ page }) => {
        await page.goto(`${process.env.BASE_URL!}/login`);
        await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER1_NAME!);
        await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER2_PASSWORD!);
        await page.getByRole('button', { name: 'ログイン' }).click();
        await expect(page.getByText(/ログインに失敗しました/)).toBeVisible();
      });
    });
  });
});
