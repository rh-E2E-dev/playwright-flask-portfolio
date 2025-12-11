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

// setup('ログイン認証保持：ユーザー1', async ({ page }) => {
//   await page.goto(`${process.env.BASE_URL!}/login`);
//   await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER1_NAME!);
//   await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER1_PASSWORD!);
//   await page.getByRole('button', { name: 'ログイン' }).click();

//   await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);

//   await page.context().storageState({ path: '.auth/user1.json' });
// });

// setup('ログイン認証保持：ユーザー2', async ({ page }) => {
//   await page.goto(`${process.env.BASE_URL!}/login`);
//   await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER2_NAME!);
//   await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER2_PASSWORD!);
//   await page.getByRole('button', { name: 'ログイン' }).click();

//   await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);

//   await page.context().storageState({ path: '.auth/user2.json' });
// });

// setup('ログイン認証保持：ユーザー3', async ({ page }) => {
//   await page.goto(`${process.env.BASE_URL!}/login`);
//   await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER3_NAME!);
//   await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER3_PASSWORD!);
//   await page.getByRole('button', { name: 'ログイン' }).click();

//   await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);

//   await page.context().storageState({ path: '.auth/user3.json' });
// });

// setup('ログイン認証保持：ユーザー4', async ({ page }) => {
//   await page.goto(`${process.env.BASE_URL!}/login`);
//   await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER4_NAME!);
//   await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER4_PASSWORD!);
//   await page.getByRole('button', { name: 'ログイン' }).click();

//   await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);

//   await page.context().storageState({ path: '.auth/user4.json' });
// });

// setup('ログイン認証保持：ユーザー5', async ({ page }) => {
//   await page.goto(`${process.env.BASE_URL!}/login`);
//   await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER5_NAME!);
//   await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER5_PASSWORD!);
//   await page.getByRole('button', { name: 'ログイン' }).click();

//   await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);

//   await page.context().storageState({ path: '.auth/user5.json' });
// });

// setup('ログイン認証保持：ユーザー6', async ({ page }) => {
//   await page.goto(`${process.env.BASE_URL!}/login`);
//   await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER6_NAME!);
//   await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER6_PASSWORD!);
//   await page.getByRole('button', { name: 'ログイン' }).click();

//   await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);

//   await page.context().storageState({ path: '.auth/user6.json' });
// });

// setup('ログイン認証保持：ユーザー7', async ({ page }) => {
//   await page.goto(`${process.env.BASE_URL!}/login`);
//   await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER7_NAME!);
//   await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER7_PASSWORD!);
//   await page.getByRole('button', { name: 'ログイン' }).click();

//   await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);

//   await page.context().storageState({ path: '.auth/user7.json' });
// });

// setup('ログイン認証保持：ユーザー8', async ({ page }) => {
//   await page.goto(`${process.env.BASE_URL!}/login`);
//   await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER8_NAME!);
//   await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER8_PASSWORD!);
//   await page.getByRole('button', { name: 'ログイン' }).click();

//   await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);

//   await page.context().storageState({ path: '.auth/user8.json' });
// });

// setup('ログイン認証保持：ユーザー9', async ({ page }) => {
//   await page.goto(`${process.env.BASE_URL!}/login`);
//   await page.getByRole('textbox', { name: 'ユーザー名' }).fill(process.env.USER9_NAME!);
//   await page.getByRole('textbox', { name: 'パスワード' }).fill(process.env.USER9_PASSWORD!);
//   await page.getByRole('button', { name: 'ログイン' }).click();

//   await expect(page).toHaveURL(`${process.env.BASE_URL!}/`);

//   await page.context().storageState({ path: '.auth/user9.json' });
// });
