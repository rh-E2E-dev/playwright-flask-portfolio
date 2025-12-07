import { test, expect, Page } from '@playwright/test';

const redirectExcapes = {
  root: '%2F',
  new: '%2Fnew',
  edit: '%2Fedit%2F',
  mypage: '%2Fmypage',
  delete: '%2Fdelete%2F',
  logout: '%2Flogout',
};

test.describe('未ログイン：リダイレクト', () => {
  test.describe('画面遷移', () => {
    test('タスク一覧画面', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login?next=${redirectExcapes.root}`);
    });
    test('タスク編集画面：ID有', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/edit/1`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login?next=${redirectExcapes.edit}1`);
    });
    test('タスク編集画面：ID無し', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/edit`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login`);
    });
    test('マイページ', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/mypage`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login?next=${redirectExcapes.mypage}`);
    });
  });
  test.describe('操作系URLへの直接アクセス', () => {
    test('タスク削除：ID有', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/delete/1`);
      await expect(page).toHaveURL(
        `${process.env.BASE_URL!}/login?next=${redirectExcapes.delete}1`,
      );
    });
    test('タスク削除：ID無し', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/delete`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login`);
    });
    test('ログアウト', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/logout`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login?next=${redirectExcapes.logout}`);
    });
  });
});

test.describe('ログイン済み', () => {
  test.use({ storageState: '../playwright/.auth/user1.json' });

  async function getOrCreateTask(page: Page) {
    await page.goto(`${process.env.BASE_URL!}/`);
    const editLinks = page.getByRole('link', { name: '編集' });
    const deleteLinks = page.getByRole('link', { name: '削除' });

    const count = await editLinks.count();

    if (count > 0) {
      return {
        editURL: await editLinks.first().getAttribute('href'),
        deleteURL: await deleteLinks.first().getAttribute('href'),
      };
    }

    await page.goto(`${process.env.BASE_URL!}/new`);
    await page
      .getByRole('textbox', { name: '入力してください' })
      .fill('自動テストで追加したタスク');
    await page.getByRole('button', { name: '作成' }).click();

    await page.goto(`${process.env.BASE_URL!}/`);
    return {
      editURL: await editLinks.first().getAttribute('href'),
      deleteURL: await deleteLinks.first().getAttribute('href'),
    };
  }

  async function getExistingTaskIds(page: Page) {
    const links = await page.getByRole('link', { name: '編集' }).all();

    const ids = [];
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (!href) continue;
      ids.push(href.split('/').pop());
    }
    return ids.map((id) => Number(id));
  }

  test.describe('画面遷移', () => {
    test('タスク一覧画面', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);
    });
    test('タスク編集画面：ID有', async ({ page }) => {
      const { editURL } = await getOrCreateTask(page);
      await page.goto(`${process.env.BASE_URL!}${editURL}`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}${editURL}`);
    });
    test('タスク編集画面：ID無し', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/edit`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);
    });
    test('マイページ', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/mypage`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/mypage`);
    });
  });
  test.describe('操作系URLへの直接アクセス', () => {
    test('タスク削除：ID有', async ({ page }) => {
      const { deleteURL } = await getOrCreateTask(page);
      const id = deleteURL?.split('/').pop();
      await page.goto(`${process.env.BASE_URL!}${deleteURL}`);
      // タスクが削除されたことを確認
      await page.goto(`${process.env.BASE_URL!}/`);
      await expect(page.locator(`a[href="/edit/${id}"]`)).toHaveCount(0);
    });
    test('タスク削除：ID無し', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/delete`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);
    });
    test('ログアウト', async ({ page }) => {
      await page.goto(`${process.env.BASE_URL!}/logout`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login`);
      await page.goto(`${process.env.BASE_URL!}/`);
      await expect(page).toHaveURL(`${process.env.BASE_URL!}/login?next=${redirectExcapes.root}`);
    });
  });
  test.describe('異常系', () => {
    test('タスク編集：存在しないID', async ({ page }) => {
      const ids = await getExistingTaskIds(page);
      const nonexistentId = Math.max(...ids) + 100;

      await page.goto(`${process.env.BASE_URL!}/edit/${nonexistentId}`);
      await expect(page.locator('body')).toContainText('Not Found');
    });
    test('タスク削除：存在しないID', async ({ page }) => {
      const ids = await getExistingTaskIds(page);
      const nonexistentId = Math.max(...ids) + 100;

      await page.goto(`${process.env.BASE_URL!}/delete/${nonexistentId}`);
      await expect(page.locator('body')).toContainText('Not Found');
    });
  });
});
