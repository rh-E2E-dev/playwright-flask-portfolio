import { test, expect } from '@playwright/test';
import { createTask, updateTaskDoneStatus, deleteTask, deleteAllTasks } from '../helpers/tasks';

test.describe('マイページ', () => {
  test.describe('タスク0件', () => {
    test.use({ storageState: '.auth/user6.json' });
    test('基本要素が表示されていること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);
      await page.getByRole('link', { name: 'My Page' }).click();
      await page.waitForURL(`${process.env.BASE_URL!}/mypage`);

      await expect(page.getByRole('heading', { name: 'マイページ' })).toBeVisible();
      await expect(page.getByRole('link', { name: '← 戻る' })).toBeVisible();
      await expect(page.getByText('ユーザー名：')).toBeVisible();
      await expect(page.getByText(process.env.USER6_NAME!)).toBeVisible();
      await expect(page.getByText('タスク総数：')).toBeVisible();
      await expect(page.getByText('完了率：')).toBeVisible();
    });
    test('スタッツの値が正しいこと', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);

      // 一覧にタスクが一件も無いことを確認
      await expect(page.getByRole('link', { name: '編集' })).toHaveCount(0);

      await page.getByRole('link', { name: 'My Page' }).click();
      await page.waitForURL(`${process.env.BASE_URL!}/mypage`);

      await expect(page.locator('#count')).toHaveText('0');
      await expect(page.locator('#rate')).toHaveText('0%');
    });
  });
  test.describe('タスクN件：すべて未完了', () => {
    test.use({ storageState: '.auth/user7.json' });
    test('スタッツの値が正しいこと', async ({ page }) => {
      const task = 'ユーザー7：マイページのスタッツ確認タスク_';
      // タスクを10件登録
      for (let i = 0; i < 10; i++) {
        await createTask(page, `${task}${i}`);
      }
      // 一覧に登録したタスクが存在することを確認
      await page.goto(`${process.env.BASE_URL!}/`);
      for (let i = 0; i < 10; i++) {
        await expect(page.getByText(`${task}${i}`)).toHaveCount(1);
      }

      await page.getByRole('link', { name: 'My Page' }).click();
      await page.waitForURL(`${process.env.BASE_URL!}/mypage`);

      // タスク総数10件、完了率0%であることを確認
      await expect(page.locator('#count')).toHaveText('10');
      await expect(page.locator('#rate')).toHaveText('0%');

      for (let i = 0; i < 10; i++) {
        await deleteTask(page, `${task}${i}`);
      }
    });
  });

  test.describe('タスクN件：完了率50%', () => {
    test.use({ storageState: '.auth/user8.json' });
    test('スタッツの値が正しいこと', async ({ page }) => {
      const task = 'ユーザー8：マイページのスタッツ確認タスク_';
      // タスクを10件登録
      for (let i = 0; i < 10; i++) {
        await createTask(page, `${task}${i}`);
      }
      // 一覧に登録したタスクが存在することを確認
      await page.goto(`${process.env.BASE_URL!}/`);
      for (let i = 0; i < 10; i++) {
        await expect(page.getByText(`${task}${i}`)).toHaveCount(1);
      }

      for (let i = 0; i < 5; i++) {
        await updateTaskDoneStatus(page, `${task}${i}`, true);
      }

      // タスク総数10件、完了率50%であることを確認
      await page.goto(`${process.env.BASE_URL!}/mypage`);
      await expect(page.locator('#count')).toHaveText('10');
      await expect(page.locator('#rate')).toHaveText('50%');

      await deleteAllTasks(page);
    });
  });
  test.describe('タスクN件：完了率100%', () => {
    test.use({ storageState: '.auth/user9.json' });
    test('スタッツの値が正しいこと', async ({ page }) => {
      const task = 'ユーザー9：マイページのスタッツ確認タスク_';
      // タスクを10件登録
      for (let i = 0; i < 10; i++) {
        await createTask(page, `${task}${i}`);
      }
      // 一覧に登録したタスクが存在することを確認
      await page.goto(`${process.env.BASE_URL!}/`);
      for (let i = 0; i < 10; i++) {
        await expect(page.getByText(`${task}${i}`)).toHaveCount(1);
      }

      for (let i = 0; i < 10; i++) {
        await updateTaskDoneStatus(page, `${task}${i}`, true);
      }

      // タスク総数10件、完了率100%であることを確認
      await page.goto(`${process.env.BASE_URL!}/mypage`);
      await expect(page.locator('#count')).toHaveText('10');
      await expect(page.locator('#rate')).toHaveText('100%');

      await deleteAllTasks(page);
    });
  });
  test.describe('基本動作確認', () => {
    test.use({ storageState: '.auth/user9.json' });
    test('戻るボタン押下でタスク一覧画面に遷移すること', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);
      await page.getByRole('link', { name: 'My Page' }).click();
      await page.waitForURL(`${process.env.BASE_URL!}/mypage`);

      await page.getByRole('link', { name: '← 戻る' }).click();
      await page.waitForURL(`${process.env.BASE_URL!}/`);
      await expect(page.getByRole('heading', { name: 'タスク一覧' })).toBeVisible();
    });
  });
});
