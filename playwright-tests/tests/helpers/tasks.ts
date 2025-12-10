import { Page } from '@playwright/test';

export async function createTask(page: Page, taskText?: string) {
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

export async function deleteTask(page: Page, taskText: string) {
  await page.goto(`${process.env.BASE_URL!}/`);
  const deleteTarget = page
    .locator('.list-group-item')
    .filter({ hasText: taskText })
    .getByRole('link', { name: '削除' });
  const href = await deleteTarget.getAttribute('href');
  const id = Number(href!.split('/').pop());
  await deleteTarget.click();
  await page.waitForURL(`${process.env.BASE_URL!}/`);
}

export async function deleteAllTasks(page: Page) {
  await page.goto(`${process.env.BASE_URL!}/`);
  const deleteButtons = page.getByRole('link', { name: '削除' });
  const count = await deleteButtons.count();

  for (let i = 0; i < count; i++) {
    await deleteButtons.nth(0).click();
    await page.waitForLoadState();
  }
}

export async function getExistingTaskIds(page: Page) {
  const editLinks = page.getByRole('link', { name: '編集' });
  const count = await editLinks.count();
  const ids = [];

  for (let i = 0; i < count; i++) {
    const href = await editLinks.nth(i).getAttribute('href');
    ids.push(Number(href!.split('/').pop()));
  }
  return ids;
}

export async function getOrCreateTask(page: Page) {
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
  await page.getByRole('textbox', { name: '入力してください' }).fill('自動テストで追加したタスク');
  await page.getByRole('button', { name: '作成' }).click();

  await page.goto(`${process.env.BASE_URL!}/`);
  return {
    editURL: await editLinks.first().getAttribute('href'),
    deleteURL: await deleteLinks.first().getAttribute('href'),
  };
}
