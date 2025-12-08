import { test, expect, Page } from '@playwright/test';

/*
TODO:
下記の検討: {
    fixtures 化した綺麗な版
    ヘルパー関数を共通ファイル化したプロジェクト構造案
    https://chatgpt.com/c/693548c5-f408-8321-8109-e5a04fe5fb9e
}
*/
async function createTask(page: Page, taskText?: string) {
  await page.goto(`${process.env.BASE_URL!}/new`);
  if (taskText) {
    await page.getByRole('textbox', { name: '入力してください' }).fill(taskText);
  } else {
    await page
      .getByRole('textbox', { name: '入力してください' })
      .fill('自動テストで追加したタスク');
  }
  await page.getByRole('button', { name: '作成' }).click();
  await page.waitForURL(`${process.env.BASE_URL!}/`);
}

async function deleteAllTasks(page: Page) {
  await page.goto(`${process.env.BASE_URL!}/`);
  const deleteButtons = page.getByRole('link', { name: '削除' });
  const count = await deleteButtons.count();

  for (let i = 0; i < count; i++) {
    await deleteButtons.nth(0).click();
    await page.waitForLoadState();
  }
}

async function getExistingTaskIds(page: Page) {
  const editLinks = page.getByRole('link', { name: '編集' });
  const count = await editLinks.count();
  const ids = [];

  for (let i = 0; i < count; i++) {
    const href = await editLinks.nth(i).getAttribute('href');
    ids.push(Number(href!.split('/').pop()));
  }
  return ids;
}

test.describe('タスク一覧画面', () => {
  test.describe('表示', () => {
    test.use({ storageState: './playwright/.auth/user1.json' });
    test('基本要素', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);
      await expect(page.getByRole('link', { name: 'My Page' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'タスク一覧' })).toHaveText('タスク一覧');
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
    test.describe('事前準備', () => {
      test.use({ storageState: './playwright/.auth/user2.json' });
      test('ユーザー2でタスク作成', async ({ page }) => {
        await createTask(page, 'ユーザー2のタスク');
        await page.goto(`${process.env.BASE_URL!}/`);
        const count = await page.getByText('ユーザー2のタスク').count();
        expect(count).toBeGreaterThan(0);
      });
    });
    test.describe('表示確認', () => {
      test.use({ storageState: './playwright/.auth/user1.json' });
      test('ユーザー1の一覧を確認', async ({ page }) => {
        await page.goto(`${process.env.BASE_URL!}/`);
        await expect(page.getByText('ユーザー2のタスク')).not.toBeVisible();
      });
    });
  });
  test.describe('基本動作', () => {
    test.use({ storageState: './playwright/.auth/user1.json' });
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
  });
});
