import { test, expect } from '@playwright/test';
import { createTask, deleteTask, getEditTarget, getExistingTaskIds } from '../helpers/tasks';

const redirectExcapes = {
  root: '%2F',
  new: '%2Fnew',
  edit: '%2Fedit%2F',
  mypage: '%2Fmypage',
  delete: '%2Fdelete%2F',
  logout: '%2Flogout',
};

test.describe('未ログイン状態', () => {
  test.describe('画面遷移', () => {
    test('タスク一覧（/）はログイン画面にリダイレクトされること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login?next=${redirectExcapes.root}`);
    });
    test('タスク新規作成（/new）はログイン画面にリダイレクトされること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/new`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login?next=${redirectExcapes.new}`);
    });
    test('タスク編集_ID有（/edit/id）はログイン画面にリダイレクトされること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/edit/1`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login?next=${redirectExcapes.edit}1`);
    });
    test('タスク編集_ID無し（/edit）はログイン画面にリダイレクトされること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/edit`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login`);
    });
    test('マイページ（/mypage）はログイン画面にリダイレクトされること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/mypage`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login?next=${redirectExcapes.mypage}`);
    });
  });
  test.describe('操作系URLへの直接アクセス', () => {
    test('タスク削除_ID有（/delete/id）はログイン画面にリダイレクトされること', async ({
      page,
    }) => {
      await page.goto(`${process.env.BASE_URL!}/delete/1`);
      await expect(page).toHaveURL(
        `${process.env.BASE_URL!}/login?next=${redirectExcapes.delete}1`,
      );
    });
    test('タスク削除_ID無し（/delete）はログイン画面にリダイレクトされること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/delete`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login`);
    });
    test('ログアウト（/logout）はログイン画面にリダイレクトされること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/logout`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login?next=${redirectExcapes.logout}`);
    });
  });
});

test.describe('ログイン状態', () => {
  test.use({ storageState: '.auth/user1.json' });
  test.describe('画面遷移', () => {
    test('タスク一覧画面（/）に遷移すること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);
    });
    test('ログイン画面（/login）に遷移すること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/login`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);
    });
    test('タスク新規作成（/new）に遷移すること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/new`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/new`);
    });
    test('タスク編集画面_ID有（/edit/id）に遷移すること', async ({ page }) => {
      const taskName = '全画面スモーク タスク編集画面：ID有 ユーザー1';
      await createTask(page, taskName);
      const { id } = await getEditTarget(page, taskName);
      await page.goto(`${process.env.BASE_URL!}/edit/${id}`);

      await expect(page).toHaveURL(`${process.env.BASE_URL!}/edit/${id}`);

      await deleteTask(page, taskName);
    });
    test('タスク編集画面_ID無し（/edit）はログイン画面にリダイレクトされること', async ({
      page,
    }) => {
      await page.goto(`${process.env.BASE_URL!}/edit`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);
    });
    test('マイページ（/mypage）に遷移すること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/mypage`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/mypage`);
    });
  });
  test.describe('操作系URLへの直接アクセス', () => {
    test('タスク削除_ID有（/delete/id）はタスク削除が実行されること', async ({ page }) => {
      const taskName = '全画面スモーク タスク削除：ID有 ユーザー1';
      await createTask(page, taskName);
      const { id } = await getEditTarget(page, taskName);
      await page.goto(`${process.env.BASE_URL!}/delete/${id}`);

      // タスクが削除されたことを確認
      await page.goto(`${process.env.BASE_URL!}/`);
      await expect(page.getByText(taskName)).toHaveCount(0);
    });
    test('タスク削除_ID無し（/delete）はログイン画面にリダイレクトされること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/delete`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);
    });
    test('ログアウト（/logout）はログアウト処理が実行されること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/logout`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login`);
      // ログアウト状態であれば、ルートにアクセスしてもログイン画面にリダイレクトされることを確認
      await page.goto(`${process.env.BASE_URL!}/`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login?next=${redirectExcapes.root}`);
    });
  });
  test.describe('異常系', () => {
    test('タスク編集_存在しないID(/edit/id)はNotFoundが表示されること', async ({ page }) => {
      const ids = await getExistingTaskIds(page);
      const nonexistentId = Math.max(...ids) + 100;

      await page.goto(`${process.env.BASE_URL!}/edit/${nonexistentId}`);
      await expect(page.locator('body')).toContainText('Not Found');
    });
    test('タスク削除_存在しないID(/delete/id)はNotFoundが表示されること', async ({ page }) => {
      const ids = await getExistingTaskIds(page);
      const nonexistentId = Math.max(...ids) + 100;

      await page.goto(`${process.env.BASE_URL!}/delete/${nonexistentId}`);
      await expect(page.locator('body')).toContainText('Not Found');
    });
  });
});
