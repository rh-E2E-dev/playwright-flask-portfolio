import { test, expect } from '@playwright/test';
import { deleteTask } from '../helpers/tasks';

test.describe('タスク新規作成画面', () => {
  test.use({ storageState: '.auth/user5.json' });
  test('基本要素が表示されていること', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL!}/new`);
    await expect(page.getByRole('heading', { name: '新規作成' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '入力してください' })).toBeEmpty();
    await expect(page.getByRole('button', { name: '作成' })).toBeEnabled();
  });
  test.describe('新規作成', () => {
    test.describe('動作（正常系）', () => {
      test('タスク新規作成を完了できること', async ({ page }) => {
        const task = '正常系テストのタスク：ユーザー5';
        await page.goto(`${process.env.BASE_URL!}/new`);
        await page.getByRole('textbox', { name: '入力してください' }).fill(task);
        await page.getByRole('button', { name: '作成' }).click();
        await page.waitForURL(`${process.env.BASE_URL!}/`);
        await expect(page.getByText(task)).toHaveCount(1);
        await deleteTask(page, task);
      });
    });
    test.describe('動作（異常系）', () => {
      test('タスク名を未入力で未入力エラーが表示されること', async ({ page }) => {
        await page.goto(`${process.env.BASE_URL!}/new`);
        await page.getByRole('button', { name: '作成' }).click();
        await expect(page.getByText('タスクを入力してください')).toBeVisible();
      });
      test('<script> が文字列として処理されること', async ({ page }) => {
        const task = `<script>alert('XSSのタスク：ユーザー5')</script>`;
        await page.goto(`${process.env.BASE_URL!}/new`);
        await page.getByRole('textbox', { name: '入力してください' }).fill(task);
        await page.getByRole('button', { name: '作成' }).click();
        await page.waitForURL(`${process.env.BASE_URL!}/`);
        await expect(page.getByText(task)).toHaveCount(1);
        await deleteTask(page, task);
      });
      test('SQLが文字列として処理されること', async ({ page }) => {
        const task = `' OR 1=1 --`;
        await page.goto(`${process.env.BASE_URL!}/new`);
        await page.getByRole('textbox', { name: '入力してください' }).fill(task);
        await page.getByRole('button', { name: '作成' }).click();
        await page.waitForURL(`${process.env.BASE_URL!}/`);
        await expect(page.getByText(task)).toHaveCount(1);
        await deleteTask(page, task);
      });
    });
  });
});
