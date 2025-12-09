import { test, expect } from '@playwright/test';
import { createTask, deleteAllTasks, getExistingTaskIds } from '../helpers/tasks';

test.describe('タスク一覧画面', () => {
  test.describe('表示', () => {
    test.use({ storageState: '.auth/user1.json' });
    test('基本要素', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);
      await expect(page.getByRole('link', { name: 'My Page' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'タスク一覧' })).toBeVisible();
      await expect(page.getByRole('link', { name: '+ 新規作成' })).toBeVisible();
    });
    test.describe('一覧表示', () => {
      test('タスク0件', async ({ page }) => {
        await deleteAllTasks(page);
        await expect(page.locator('.list-group-item')).toHaveCount(0);
        await expect(page.getByRole('link', { name: '編集' })).toHaveCount(0);
        await expect(page.getByRole('link', { name: '削除' })).toHaveCount(0);
      });
      test('タスクN件', async ({ page }) => {
        await createTask(page);
        const ids = await getExistingTaskIds(page);
        await expect(page.getByRole('link', { name: '編集' })).toHaveCount(ids.length);
        await expect(page.getByRole('link', { name: '削除' })).toHaveCount(ids.length);
      });
    });
  });
  test.describe('他人のタスクが表示されていないか？', () => {
    const task = 'ユーザー4のタスク';

    test.describe('事前準備', () => {
      test.use({ storageState: '.auth/user4.json' });
      test('ユーザー4でタスク作成', async ({ page }) => {
        await createTask(page, task);
        await page.goto(`${process.env.BASE_URL!}/`);
        const count = await page.getByText(task).count();
        expect(count).toBeGreaterThan(0);
      });
    });

    test.describe('表示確認', () => {
      test.use({ storageState: '.auth/user3.json' });
      test('ユーザー3の一覧を確認', async ({ page }) => {
        await page.goto(`${process.env.BASE_URL!}/`);
        await expect(page.getByText(task)).toHaveCount(0);
      });
    });
  });

  test.describe('基本動作', () => {
    test.use({ storageState: '.auth/user3.json' });
    test('新規作成ボタン', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);
      await page.getByRole('link', { name: '+ 新規作成' }).click();
      await page.waitForURL(`${process.env.BASE_URL!}/new`);
      await expect(page.getByRole('heading', { name: '新規作成' })).toBeVisible();
    });
    test('編集ボタン', async ({ page }) => {
      const task = '編集ボタンテストタスク';
      await createTask(page, task);
      await page.goto(`${process.env.BASE_URL!}/`);
      const editTarget = page
        .locator('.list-group-item')
        .filter({ hasText: task })
        .getByRole('link', { name: '編集' });
      const href = await editTarget.getAttribute('href');
      const id = Number(href!.split('/').pop());
      await editTarget.click();
      await page.waitForURL(`${process.env.BASE_URL!}/edit/${id}`);
      await expect(page.getByRole('heading', { name: '編集' })).toBeVisible();
      await expect(page.getByRole('textbox')).toHaveValue(task);

      // テストに利用したタスクを削除
      await page.goto(`${process.env.BASE_URL!}/delete/${id}`);
    });
    test('削除ボタン', async ({ page }) => {
      const task = '削除ボタンテストタスク';
      await createTask(page, task);

      await page.goto(`${process.env.BASE_URL!}/`);
      const deleteTarget = page.locator('.list-group-item').filter({ hasText: task });
      await expect(deleteTarget).toHaveCount(1);

      await deleteTarget.getByRole('link', { name: '削除' }).click();
      await page.waitForURL(`${process.env.BASE_URL!}/`);
      await expect(deleteTarget).toHaveCount(0);
    });
    test('マイページボタン', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);
      await page.getByRole('link', { name: 'My Page' }).click();
      await page.waitForURL(`${process.env.BASE_URL!}/mypage`);
      await expect(page.getByRole('heading', { name: 'マイページ' })).toBeVisible();
    });
    test('ログアウトボタン', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);
      await page.getByRole('link', { name: 'Logout' }).click();
      await page.waitForURL(`${process.env.BASE_URL!}/login`);
      await page.goto(`${process.env.BASE_URL!}/`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login?next=%2F`);
    });
  });
});
