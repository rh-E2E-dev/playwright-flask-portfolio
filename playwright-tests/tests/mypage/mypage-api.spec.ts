import { test, expect } from '../fixtures/apiClient';
import { request } from '@playwright/test';

test.describe.serial('APIテスト', () => {
  test.describe('done_rateの計算処理', () => {
    test.describe('正常系', () => {
      test('done_rateの値が0%になること', async ({ authedAPI }) => {
        // DB のセットアップ
        await authedAPI.post('/api/test/setup', {
          data: { total: 10, done: 0 },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const res = await authedAPI.get('/api/stats');
        const data = await res.json();

        expect(data.done_rate).toBe(0);
      });
      test('done_rateの値が33%になること', async ({ authedAPI }) => {
        // DB のセットアップ
        await authedAPI.post('/api/test/setup', {
          data: { total: 3, done: 1 },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const res = await authedAPI.get('/api/stats');
        const data = await res.json();

        expect(Math.round(data.done_rate * 100)).toBe(33);
      });

      test('done_rateの値が67%になること', async ({ authedAPI }) => {
        // DB のセットアップ
        await authedAPI.post('/api/test/setup', {
          data: { total: 3, done: 2 },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const res = await authedAPI.get('/api/stats');
        const data = await res.json();

        expect(Math.round(data.done_rate * 100)).toBe(67);
      });

      test('done_rateの値が100%になること', async ({ authedAPI }) => {
        // DB のセットアップ
        await authedAPI.post('/api/test/setup', {
          data: { total: 10, done: 10 },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const res = await authedAPI.get('/api/stats');
        const data = await res.json();

        expect(Math.round(data.done_rate * 100)).toBe(100);
      });

      test('done_rateの値が50%になること_大きな値', async ({ authedAPI }) => {
        // DB のセットアップ
        await authedAPI.post('/api/test/setup', {
          data: { total: 10000, done: 5000 },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const res = await authedAPI.get('/api/stats');
        const data = await res.json();

        expect(Math.round(data.done_rate * 100)).toBe(50);
      });
    });
    test.describe('異常系', () => {
      test('total < done の場合は100%になること', async ({ authedAPI }) => {
        // DB のセットアップ
        await authedAPI.post('/api/test/setup', {
          data: { total: 1, done: 10 },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const res = await authedAPI.get('/api/stats');
        const data = await res.json();
        console.log(data.done_rate);

        expect(Math.round(data.done_rate * 100)).toBe(100); // 最大100%に丸める仕様のため
      });

      test('totalやdoneが未定義やnullでも0%として返されること_1', async ({ authedAPI }) => {
        // DB のセットアップ
        await authedAPI.post('/api/test/setup', {
          data: { total: undefined, done: null },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const res = await authedAPI.get('/api/stats');
        const data = await res.json();
        console.log(data.done_rate);

        expect(Math.round(data.done_rate * 100)).toBe(0);
        expect(data.task_count).toBe(0);
      });

      test('totalやdoneが未定義やnullでも0%として返されること_2', async ({ authedAPI }) => {
        // DB のセットアップ
        await authedAPI.post('/api/test/setup', {
          data: { total: null, done: undefined },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const res = await authedAPI.get('/api/stats');
        const data = await res.json();
        console.log(data.done_rate);

        expect(Math.round(data.done_rate * 100)).toBe(0);
        expect(data.task_count).toBe(0);
      });
    });
  });

  test.describe('ステータスコード', () => {
    test.describe('正常系', () => {
      test('ログインなしでは302が返ること', async () => {
        const api = await request.newContext({
          baseURL: process.env.BASE_URL!,
        });
        const res = await api.get('/api/stats', {
          maxRedirects: 0, // loginにリダイレクトすると200が返るため設定
        });
        expect(res.status()).toBe(302);
        expect(res.headers()['location']).toContain('/login');
      });

      test('ログイン済みなら200が返ること', async ({ authedAPI }) => {
        const res = await authedAPI.get('/api/stats');
        expect(res.status()).toBe(200);
      });
    });
  });

  test.describe('JSON返却動作', () => {
    test.describe('正常系', () => {
      test('{ done_rate, task_count, username }が返ってくること', async ({ authedAPI }) => {
        const res = await authedAPI.get('/api/stats');
        expect(res.ok()).toBeTruthy();
        expect(res.headers()['content-type']).toContain('application/json');

        const data = await res.json();
        expect(data).toHaveProperty('username');
        expect(data).toHaveProperty('task_count');
        expect(data).toHaveProperty('done_rate');
      });

      test('done_rateとtask_countの値がnumber型であること', async ({ authedAPI }) => {
        const res = await authedAPI.get('/api/stats');
        expect(res.ok()).toBeTruthy();
        expect(res.headers()['content-type']).toContain('application/json');

        const data = await res.json();
        expect(typeof data.task_count === 'number').toBeTruthy();
        expect(typeof data.done_rate === 'number').toBeTruthy();
      });
    });

    test.describe('異常系', () => {
      test.use({ storageState: '.auth/user11.json' });
      test('done_rateとtask_countの値がstring型の場合でもUIがクラッシュしないこと', async ({
        page,
      }) => {
        await page.route('**/api/stats', async (route) => {
          await route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'test',
              task_count: '10',
              done_rate: '0.5',
            }),
          });
        });

        await page.goto(`${process.env.BASE_URL!}/mypage`);

        // API終了を待つ
        await page.waitForResponse(
          (res) => /\/api\/stats$/.test(res.url()) && res.status() === 200,
        );

        await expect(page.getByText('test')).toBeVisible();
        await expect(page.locator('#count')).toHaveText('10');
        await expect(page.locator('#rate')).toHaveText('50%');
      });
    });
  });
});

test.describe('マイページ（APIモック）', () => {
  test.use({ storageState: '.auth/user11.json' });

  test.describe('フォーマット', () => {
    test('表示フォーマットが正しいこと', async ({ page }) => {
      await page.route('**/api/stats', async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'test',
            task_count: 10000,
            done_rate: 0.33333,
          }),
        });
      });

      await page.goto(`${process.env.BASE_URL!}/mypage`);

      // API終了を待つ
      await page.waitForResponse((res) => /\/api\/stats$/.test(res.url()) && res.status() === 200);

      await expect(page.locator('#count')).toHaveText('10000'); // 桁区切りが無いことを確認
      await expect(page.locator('#rate')).toHaveText('33%'); // 小数点の丸め処理、%表記を確認
    });
  });

  test.describe('完了率', () => {
    test('完了率が整数になる場合の表示が正しいこと', async ({ page }) => {
      await page.route('**/api/stats', async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'test',
            task_count: 10,
            done_rate: 0.99,
          }),
        });
      });

      await page.goto(`${process.env.BASE_URL!}/mypage`);

      // API終了を待つ
      await page.waitForResponse((res) => /\/api\/stats$/.test(res.url()) && res.status() === 200);

      await expect(page.getByText('test')).toBeVisible();
      await expect(page.locator('#count')).toHaveText('10');
      await expect(page.locator('#rate')).toHaveText('99%');
    });

    test('完了率が少数になる場合の表示が正しいこと', async ({ page }) => {
      await page.route('**/api/stats', async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'test',
            task_count: 7,
            done_rate: 0.428571428571429, // 3/7完了の場合の値
          }),
        });
      });

      await page.goto(`${process.env.BASE_URL!}/mypage`);

      // API終了を待つ
      await page.waitForResponse((res) => /\/api\/stats$/.test(res.url()) && res.status() === 200);

      await expect(page.getByText('test')).toBeVisible();
      await expect(page.locator('#count')).toHaveText('7');
      await expect(page.locator('#rate')).toHaveText('43%');
    });
  });

  test.describe('タスク総数', () => {
    test('タスク総数が0の場合の表示が正しいこと', async ({ page }) => {
      await page.route('**/api/stats', async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'test',
            task_count: 0,
            done_rate: 0,
          }),
        });
      });

      await page.goto(`${process.env.BASE_URL!}/mypage`);

      // API終了を待つ
      await page.waitForResponse((res) => /\/api\/stats$/.test(res.url()) && res.status() === 200);

      await expect(page.getByText('test')).toBeVisible();
      await expect(page.locator('#count')).toHaveText('0');
      await expect(page.locator('#rate')).toHaveText('0%');
    });

    test('タスク総数が100000の場合の表示が正しいこと', async ({ page }) => {
      await page.route('**/api/stats', async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'test',
            task_count: 100000,
            done_rate: 0.4,
          }),
        });
      });

      await page.goto(`${process.env.BASE_URL!}/mypage`);

      // API終了を待つ
      await page.waitForResponse((res) => /\/api\/stats$/.test(res.url()) && res.status() === 200);

      await expect(page.getByText('test')).toBeVisible();
      await expect(page.locator('#count')).toHaveText('100000');
      await expect(page.locator('#rate')).toHaveText('40%');
    });
  });

  test.describe('ユーザー名', () => {
    test('ユーザー名が日本語でも正しく表示されること', async ({ page }) => {
      await page.route('**/api/stats', async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: '検証　はじめ',
            task_count: 10,
            done_rate: 0.5,
          }),
        });
      });

      await page.goto(`${process.env.BASE_URL!}/mypage`);

      // API終了を待つ
      await page.waitForResponse((res) => /\/api\/stats$/.test(res.url()) && res.status() === 200);

      await expect(page.getByText('検証　はじめ')).toBeVisible();
      await expect(page.locator('#count')).toHaveText('10');
      await expect(page.locator('#rate')).toHaveText('50%');
    });

    test('ユーザー名が半角記号でも正しく表示されること', async ({ page }) => {
      await page.route('**/api/stats', async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: `!"#$%&'()=~|¥+-*/?/[]{}`,
            task_count: 10,
            done_rate: 0.5,
          }),
        });
      });

      await page.goto(`${process.env.BASE_URL!}/mypage`);

      // API終了を待つ
      await page.waitForResponse((res) => /\/api\/stats$/.test(res.url()) && res.status() === 200);

      await expect(page.getByText(`!"#$%&'()=~|¥+-*/?/[]{}`)).toBeVisible();
      await expect(page.locator('#count')).toHaveText('10');
      await expect(page.locator('#rate')).toHaveText('50%');
    });

    test('ユーザー名が日本語 + 半角英数記号でも正しく表示されること', async ({ page }) => {
      await page.route('**/api/stats', async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: `検証　はじめ qwertyui !"#$%&'()=~|¥+-*/?/[]{}`,
            task_count: 10,
            done_rate: 0.5,
          }),
        });
      });

      await page.goto(`${process.env.BASE_URL!}/mypage`);

      // API終了を待つ
      await page.waitForResponse((res) => /\/api\/stats$/.test(res.url()) && res.status() === 200);

      await expect(page.getByText(`検証　はじめ qwertyui !"#$%&'()=~|¥+-*/?/[]{}`)).toBeVisible();
      await expect(page.locator('#count')).toHaveText('10');
      await expect(page.locator('#rate')).toHaveText('50%');
    });

    test('ユーザー名が100文字でも正しく表示されること', async ({ page }) => {
      await page.route('**/api/stats', async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: `TcW_4f5jj4Sh2JHKjb7xg5y24H7kiTLjwXKJ6r8rBNZQSENhEkPp_YUQWXpsBatyu9-yhM37_jQJ-j7GTC8p3efEhbxfcTwpnyc8`,
            task_count: 10,
            done_rate: 0.5,
          }),
        });
      });

      await page.goto(`${process.env.BASE_URL!}/mypage`);

      // API終了を待つ
      await page.waitForResponse((res) => /\/api\/stats$/.test(res.url()) && res.status() === 200);

      await expect(
        page.getByText(
          `TcW_4f5jj4Sh2JHKjb7xg5y24H7kiTLjwXKJ6r8rBNZQSENhEkPp_YUQWXpsBatyu9-yhM37_jQJ-j7GTC8p3efEhbxfcTwpnyc8`,
        ),
      ).toBeVisible();
      await expect(page.locator('#count')).toHaveText('10');
      await expect(page.locator('#rate')).toHaveText('50%');
    });

    test('ユーザー名が空文字でも正しく表示されること', async ({ page }) => {
      await page.route('**/api/stats', async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: '',
            task_count: 10,
            done_rate: 0.5,
          }),
        });
      });

      await page.goto(`${process.env.BASE_URL!}/mypage`);

      // API終了を待つ
      await page.waitForResponse((res) => /\/api\/stats$/.test(res.url()) && res.status() === 200);

      await expect(page.locator('#username')).toHaveText('');
      await expect(page.locator('#count')).toHaveText('10');
      await expect(page.locator('#rate')).toHaveText('50%');
    });
  });
  test.describe('運用系', () => {
    test('APIエラー時にUIがクラッシュしないこと', async ({ page }) => {
      page.route('**/api/stats', (route) => route.abort());
      await page.goto(`${process.env.BASE_URL!}/mypage`);

      await expect(page.locator('#username')).toHaveText('');
      await expect(page.locator('#count')).toHaveText('');
      await expect(page.locator('#rate')).toHaveText('');
    });

    test('セッションタイムアウト時の動作確認', async ({ page }) => {
      await page.route('**/api/stats', async (route) => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Unauthorized' }),
        });
      });

      await page.goto(`${process.env.BASE_URL!}/mypage`);

      // API終了を待つ
      await page.waitForResponse((res) => /\/api\/stats$/.test(res.url()) && res.status() === 401);

      await page.getByRole('link', { name: '← 戻る' }).click();
      await page.waitForURL(`${process.env.BASE_URL!}/`); // /api/statsが401の場合でも通常通り操作続行できる仕様のため
      await expect(page.getByRole('heading', { name: 'タスク一覧' })).toBeVisible();
    });
  });
});
