import { test, expect } from '@playwright/test';
import { createTask, deleteTask, deleteAllTasks, getEditTarget } from '../helpers/tasks';

test.describe('タスク一覧画面', () => {
  test.describe('表示', () => {
    test.use({ storageState: '.auth/user1.json' });
    test('基本要素が表示されていること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);
      await expect(page.getByRole('link', { name: 'My Page' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'タスク一覧' })).toBeVisible();
      await expect(page.getByRole('link', { name: '+ 新規作成' })).toBeVisible();
    });
  });
  test.describe('一覧表示：タスクN件', () => {
    test.use({ storageState: '.auth/user1.json' });
    test('タスクがN件表示されていること', async ({ page }) => {
      const taskName = 'タスク一覧画面 表示 タスクN件_ユーザー1_';
      for (let i = 0; i < 10; i++) {
        await createTask(page, `${taskName}${i}`);
      }
      await page.goto(`${process.env.BASE_URL!}/`);
      for (let i = 0; i < 10; i++) {
        await expect(page.getByText(`${taskName}${i}`)).toHaveCount(1);
      }
      for (let i = 0; i < 10; i++) {
        await deleteTask(page, `${taskName}${i}`);
      }
    });
  });
  test.describe('一覧表示：タスク0件', () => {
    test.use({ storageState: '.auth/user2.json' });
    test('タスクが1件も表示されていないこと', async ({ page }) => {
      await deleteAllTasks(page);
      await expect(page.locator('.list-group-item')).toHaveCount(0);
      await expect(page.getByRole('link', { name: '編集' })).toHaveCount(0);
      await expect(page.getByRole('link', { name: '削除' })).toHaveCount(0);
    });
  });

  test.describe('他人のタスク', () => {
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
      test('ユーザー3の一覧にユーザー4のタスクが表示されていないこと', async ({ page }) => {
        await page.goto(`${process.env.BASE_URL!}/`);
        await expect(page.getByText(task)).toHaveCount(0);
      });
    });
  });

  test.describe('動作', () => {
    test.use({ storageState: '.auth/user3.json' });
    test('新規作成ボタン押下で新規作成画面に遷移すること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);
      await page.getByRole('link', { name: '+ 新規作成' }).click();
      await page.waitForURL(`${process.env.BASE_URL!}/new`);
      await expect(page.getByRole('heading', { name: '新規作成' })).toBeVisible();
    });
    test('編集ボタン押下で編集画面に遷移すること', async ({ page }) => {
      const task = '編集ボタンテストタスク';
      await createTask(page, task);
      await page.goto(`${process.env.BASE_URL!}/`);
      const { editTarget, id } = await getEditTarget(page, task);

      await editTarget.click();
      await page.waitForURL(`${process.env.BASE_URL!}/edit/${id}`);
      await expect(page.getByRole('heading', { name: '編集' })).toBeVisible();
      await expect(page.getByRole('textbox')).toHaveValue(task);

      // テストに利用したタスクを削除
      await page.goto(`${process.env.BASE_URL!}/delete/${id}`);
    });
    test('削除ボタン押下でタスク削除が実行されること', async ({ page }) => {
      const task = '削除ボタンテストタスク';
      await createTask(page, task);

      await page.goto(`${process.env.BASE_URL!}/`);
      const deleteTarget = page.locator('.list-group-item').filter({ hasText: task });
      await expect(deleteTarget).toHaveCount(1);

      await deleteTarget.getByRole('link', { name: '削除' }).click();
      await page.waitForURL(`${process.env.BASE_URL!}/`);
      await expect(deleteTarget).toHaveCount(0);
    });
    test('マイページボタン押下でマイページに遷移すること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);
      await page.getByRole('link', { name: 'My Page' }).click();
      await page.waitForURL(`${process.env.BASE_URL!}/mypage`);
      await expect(page.getByRole('heading', { name: 'マイページ' })).toBeVisible();
    });
    test('ログアウトボタン押下でログアウト処理が実行されること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);
      await page.getByRole('link', { name: 'Logout' }).click();
      await page.waitForURL(`${process.env.BASE_URL!}/login`);
      await page.goto(`${process.env.BASE_URL!}/`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login?next=%2F`);
    });
  });
});
