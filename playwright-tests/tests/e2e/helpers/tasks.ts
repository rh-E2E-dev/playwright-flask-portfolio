import { Page } from '@playwright/test';

export async function createTask(page: Page, taskName?: string) {
  await page.goto(`${process.env.BASE_URL!}/new`);
  if (taskName) {
    await page.getByRole('textbox', { name: '入力してください' }).fill(taskName);
  } else {
    await page
      .getByRole('textbox', { name: '入力してください' })
      .fill('自動テストで追加したタスク');
  }
  await page.getByRole('button', { name: '作成' }).click();
  await page.waitForURL(`${process.env.BASE_URL!}/`);
}

export async function updateTaskDoneStatus(page: Page, taskName: string, isDone: boolean) {
  // 一覧で編集対象のリンクとIDを取得 → 編集画面へ遷移
  await page.goto(`${process.env.BASE_URL!}/`);
  const editTarget = page
    .locator('.list-group-item')
    .filter({ hasText: taskName })
    .getByRole('link', { name: '編集' });
  const href = await editTarget.getAttribute('href');
  const id = Number(href!.split('/').pop());
  await editTarget.click();
  await page.waitForURL(`${process.env.BASE_URL!}/edit/${id}`);

  if (isDone) {
    // タスク完了済みにして編集画面を再度表示する
    await page.getByRole('checkbox', { name: 'done' }).check();
    await page.getByRole('button', { name: '更新' }).click();
    await page.waitForURL(`${process.env.BASE_URL!}/`);
  } else {
    await page.getByRole('checkbox', { name: 'done' }).uncheck();
    await page.getByRole('button', { name: '更新' }).click();
    await page.waitForURL(`${process.env.BASE_URL!}/`);
  }
}

export async function deleteTask(page: Page, taskName: string) {
  await page.goto(`${process.env.BASE_URL!}/`);
  const deleteTarget = page
    .locator('.list-group-item')
    .filter({ hasText: taskName })
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

export async function getEditTarget(page: Page, taskName: string) {
  await page.goto(`${process.env.BASE_URL!}/`);
  const editTarget = page
    .locator('.list-group-item')
    .filter({ hasText: taskName })
    .getByRole('link', { name: '編集' });
  const href = await editTarget.getAttribute('href');
  const id = Number(href!.split('/').pop());
  return {
    editTarget,
    id,
  };
}
