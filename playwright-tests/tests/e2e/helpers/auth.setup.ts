import { test as setup, expect, Page } from '@playwright/test';

async function loginAndSaveState(page: Page, username: string, password: string, file: string) {
  await page.goto(`${process.env.BASE_URL!}/login`);
  await page.getByRole('textbox', { name: 'ユーザー名' }).fill(username);
  await page.getByRole('textbox', { name: 'パスワード' }).fill(password);
  await page.getByRole('button', { name: 'ログイン' }).click();

  await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);
  await page.context().storageState({ path: file });
}

const users = `${process.env.USERS}`.split(',');

for (const id of users) {
  const name = process.env[`NAME_${id}`]!;
  const password = process.env[`PASSWORD_${id}`]!;
  const file = `.auth/${id}.json`;

  setup(`ログイン認証保持：${id}`, async ({ page }) => {
    await loginAndSaveState(page, name, password, file);
  });
}
