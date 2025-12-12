import { test, expect } from '@playwright/test';
import { createTask, deleteTask, getEditTarget } from '../helpers/tasks';

test.describe('タスク編集画面', () => {
  test.use({ storageState: '.auth/user5.json' });
  test.describe('表示', () => {
    test('未完了タスクの編集画面の表示が正しいこと', async ({ page }) => {
      const task = '編集画面表示確認のタスク_未完了タスク：ユーザー5';
      await createTask(page, task);

      // 一覧で編集対象のリンクとIDを取得 → 編集画面へ遷移
      await page.goto(`${process.env.BASE_URL!}/`);
      const { editTarget, id } = await getEditTarget(page, task);
      await editTarget.click();
      await page.waitForURL(`${process.env.BASE_URL!}/edit/${id}`);

      await expect(page.getByRole('heading', { name: '編集' })).toBeVisible();
      await expect(page.getByRole('textbox')).toHaveValue(task);
      await expect(page.getByRole('checkbox', { name: 'done' })).not.toBeChecked();
      await expect(page.getByRole('button', { name: '更新' })).toBeEnabled();

      await deleteTask(page, task);
    });
    test('完了済みタスクの編集画面の表示が正しいこと', async ({ page }) => {
      const task = '編集画面表示確認のタスク_完了済みタスク：ユーザー5';
      await createTask(page, task);

      // 一覧で編集対象のリンクとIDを取得 → 編集画面へ遷移
      await page.goto(`${process.env.BASE_URL!}/`);
      const { editTarget, id } = await getEditTarget(page, task);
      await editTarget.click();
      await page.waitForURL(`${process.env.BASE_URL!}/edit/${id}`);

      // タスク完了済みにして編集画面を再度表示する
      await page.getByRole('checkbox', { name: 'done' }).check();
      await page.getByRole('button', { name: '更新' }).click();
      await page.waitForURL(`${process.env.BASE_URL!}/`);
      await editTarget.click();
      await page.waitForURL(`${process.env.BASE_URL!}/edit/${id}`);

      await expect(page.getByRole('heading', { name: '編集' })).toBeVisible();
      await expect(page.getByRole('textbox')).toHaveValue(task);
      await expect(page.getByRole('checkbox', { name: 'done' })).toBeChecked();
      await expect(page.getByRole('button', { name: '更新' })).toBeEnabled();

      await deleteTask(page, task);
    });
  });

  test.describe('動作（正常系）', () => {
    test.describe('完了チェック', () => {
      test('未完了 → 完了に更新できること', async ({ page }) => {
        const task = '編集画面動作確認のタスク_未完了→完了：ユーザー5';
        await createTask(page, task);

        // 一覧で編集対象のリンクとIDを取得 → 編集画面へ遷移
        await page.goto(`${process.env.BASE_URL!}/`);
        const { editTarget, id } = await getEditTarget(page, task);
        await editTarget.click();
        await page.waitForURL(`${process.env.BASE_URL!}/edit/${id}`);

        await page.getByRole('checkbox', { name: 'done' }).check();
        await page.getByRole('button', { name: '更新' }).click();
        await page.waitForURL(`${process.env.BASE_URL!}/`);
        await editTarget.click();
        await page.waitForURL(`${process.env.BASE_URL!}/edit/${id}`);

        await expect(page.getByRole('textbox')).toHaveValue(task);
        await expect(page.getByRole('checkbox', { name: 'done' })).toBeChecked();

        // 一覧への反映確認
        await page.goto(`${process.env.BASE_URL!}/`);
        await expect(page.getByText(`${task} (done)`)).toHaveCount(1);
        await deleteTask(page, task);
      });
      test('完了 → 未完了に更新できること', async ({ page }) => {
        const task = '編集画面動作確認のタスク_完了→未完了：ユーザー5';
        await createTask(page, task);

        // 一覧で編集対象のリンクとIDを取得 → 編集画面へ遷移
        await page.goto(`${process.env.BASE_URL!}/`);
        const editTarget = page
          .locator('.list-group-item')
          .filter({ hasText: task })
          .getByRole('link', { name: '編集' });
        const href = await editTarget.getAttribute('href');
        const id = Number(href!.split('/').pop());
        await editTarget.click();
        await page.waitForURL(`${process.env.BASE_URL!}/edit/${id}`);

        // タスク完了済みにして編集画面を再度表示する
        await page.getByRole('checkbox', { name: 'done' }).check();
        await page.getByRole('button', { name: '更新' }).click();
        await page.waitForURL(`${process.env.BASE_URL!}/`);
        await expect(page.getByText(`${task} (done)`)).toHaveCount(1);

        await editTarget.click();
        await page.waitForURL(`${process.env.BASE_URL!}/edit/${id}`);

        await expect(page.getByRole('textbox')).toHaveValue(task);
        await expect(page.getByRole('checkbox', { name: 'done' })).toBeChecked();

        // 完了→未完了へ変更して編集画面を再度表示する
        await page.getByRole('checkbox', { name: 'done' }).uncheck();
        await page.getByRole('button', { name: '更新' }).click();
        await page.waitForURL(`${process.env.BASE_URL!}/`);
        await editTarget.click();
        await page.waitForURL(`${process.env.BASE_URL!}/edit/${id}`);

        await expect(page.getByRole('textbox')).toHaveValue(task);
        await expect(page.getByRole('checkbox', { name: 'done' })).not.toBeChecked();

        // 一覧への反映確認
        await page.goto(`${process.env.BASE_URL!}/`);
        await expect(page.getByText(`${task}`)).toHaveCount(1);
        await deleteTask(page, task);
      });
    });

    test.describe('タスク名変更', () => {
      test('未完了タスクのタスク名を変更できること', async ({ page }) => {
        const task = '編集画面動作確認のタスク_未完了のタスク名変更：ユーザー5';
        const changedTask = '編集画面動作確認のタスク_未完了のタスク名変更：user5';

        // 一覧で編集対象のリンクとIDを取得 → 編集画面へ遷移
        await createTask(page, task);
        await page.goto(`${process.env.BASE_URL!}/`);
        const { editTarget, id } = await getEditTarget(page, task);
        await editTarget.click();
        await page.waitForURL(`${process.env.BASE_URL!}/edit/${id}`);

        // 変更前のタスクであることを念の為確認
        await expect(page.getByRole('textbox')).toHaveValue(task);
        await expect(page.getByRole('checkbox', { name: 'done' })).not.toBeChecked();

        // タスク名を変更
        await page.getByRole('textbox').fill(changedTask);
        await page.getByRole('button', { name: '更新' }).click();
        await page.waitForURL(`${process.env.BASE_URL!}/`);

        await expect(page.getByText(task)).toHaveCount(0);
        await expect(page.getByText(changedTask)).toHaveCount(1);

        // 一覧で編集対象のリンクとIDを取得 → 編集画面へ遷移
        const { editTarget: changedEditTarget, id: changedId } = await getEditTarget(
          page,
          changedTask,
        );
        await changedEditTarget.click();
        await page.waitForURL(`${process.env.BASE_URL!}/edit/${changedId}`);

        await expect(page.getByRole('textbox')).toHaveValue(changedTask);
        await expect(page.getByRole('checkbox', { name: 'done' })).not.toBeChecked();

        await deleteTask(page, changedTask);
      });
      test('完了済みタスクのタスク名を変更できること', async ({ page }) => {
        const task = '編集画面動作確認のタスク_完了済みのタスク名変更：ユーザー5';
        const changedTask = '編集画面動作確認のタスク_完了済みのタスク名変更：user5';
        await createTask(page, task);

        // 一覧で編集対象のリンクとIDを取得 → 編集画面へ遷移
        await page.goto(`${process.env.BASE_URL!}/`);
        const { editTarget, id } = await getEditTarget(page, task);
        await editTarget.click();
        await page.waitForURL(`${process.env.BASE_URL!}/edit/${id}`);

        // 変更前のタスクであることを念の為確認
        await expect(page.getByRole('textbox')).toHaveValue(task);

        // タスク完了済みにして編集画面を再度表示する
        await page.getByRole('checkbox', { name: 'done' }).check();
        await page.getByRole('button', { name: '更新' }).click();
        await page.waitForURL(`${process.env.BASE_URL!}/`);

        await expect(page.getByText(`${task} (done)`)).toHaveCount(1);

        await editTarget.click();
        await page.waitForURL(`${process.env.BASE_URL!}/edit/${id}`);

        await expect(page.getByRole('checkbox', { name: 'done' })).toBeChecked();
        await expect(page.getByRole('textbox')).toHaveValue(task);

        // タスク名を変更
        await page.getByRole('textbox').fill(changedTask);
        await page.getByRole('button', { name: '更新' }).click();
        await page.waitForURL(`${process.env.BASE_URL!}/`);

        await expect(page.getByText(`${task} (done)`)).toHaveCount(0);
        await expect(page.getByText(`${changedTask} (done)`)).toHaveCount(1);

        // 一覧で編集対象のリンクとIDを取得 → 編集画面へ遷移
        const { editTarget: changedEditTarget, id: changedId } = await getEditTarget(
          page,
          changedTask,
        );
        await changedEditTarget.click();
        await page.waitForURL(`${process.env.BASE_URL!}/edit/${changedId}`);

        await expect(page.getByRole('textbox')).toHaveValue(changedTask);
        await expect(page.getByRole('checkbox', { name: 'done' })).toBeChecked();

        await deleteTask(page, changedTask);
      });
    });
  });

  test.describe('動作（異常系）', () => {
    test('タスク名を未入力で未入力エラーが表示されること', async ({ page }) => {
      const task = '編集画面動作確認のタスク_未入力：ユーザー5';

      // 一覧で編集対象のリンクとIDを取得 → 編集画面へ遷移
      await createTask(page, task);
      await page.goto(`${process.env.BASE_URL!}/`);
      const { editTarget, id } = await getEditTarget(page, task);
      await editTarget.click();
      await page.waitForURL(`${process.env.BASE_URL!}/edit/${id}`);

      // タスク名を空にして更新
      await page.getByRole('textbox').clear();
      await page.getByRole('button', { name: '更新' }).click();
      await expect(page.getByText('タスクを入力してください')).toBeVisible();

      // 一覧画面で当該タスクの変更が反映されていないことを確認
      await page.goto(`${process.env.BASE_URL!}/`);
      await expect(page.getByText(task)).toHaveCount(1);

      await deleteTask(page, task);
    });
  });
});
