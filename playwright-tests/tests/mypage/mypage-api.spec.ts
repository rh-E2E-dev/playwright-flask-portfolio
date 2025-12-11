import { test, expect } from '../fixtures/authedAPI';
import { request } from '@playwright/test';

test.describe.serial('APIテスト', () => {
  test('done_rateの計算が正しいこと_0%（0除算回避がされているか）', async ({ authedAPI }) => {
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

  test('done_rateの計算が正しいこと_50%', async ({ authedAPI }) => {
    // DB のセットアップ
    await authedAPI.post('/api/test/setup', {
      data: { total: 10, done: 5 },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await authedAPI.get('/api/stats');
    const data = await res.json();

    expect(data.done_rate).toBe(0.5);
  });

  test('done_rateの計算が正しいこと_100%', async ({ authedAPI }) => {
    // DB のセットアップ
    await authedAPI.post('/api/test/setup', {
      data: { total: 10, done: 10 },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await authedAPI.get('/api/stats');
    const data = await res.json();

    expect(data.done_rate).toBe(1);
  });

  test('done_rateの計算が正しいこと_50%_大きな値', async ({ authedAPI }) => {
    // DB のセットアップ
    await authedAPI.post('/api/test/setup', {
      data: { total: 10000, done: 5000 },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await authedAPI.get('/api/stats');
    const data = await res.json();

    expect(data.done_rate).toBe(0.5);
  });
});

test.describe.serial('APIの基本仕様', () => {
  test('JSONが返ってくること', async ({ authedAPI }) => {
    const res = await authedAPI.get('/api/stats');
    expect(res.ok()).toBeTruthy();
    expect(res.headers()['content-type']).toContain('application/json');

    const data = await res.json();
    expect(data).toHaveProperty('done_rate');
    expect(data).toHaveProperty('task_count');
    expect(data).toHaveProperty('username');
  });

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

test.describe('APIモックでのUIテスト', () => {
  test.use({ storageState: '.auth/user11.json' });

  test('スタッツの値が正しいこと', async ({ page }) => {
    await page.route('**/api/stats', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'test',
          task_count: 10,
          done_rate: 0.5,
        }),
      });
    });

    await page.goto(`${process.env.BASE_URL!}/mypage`);

    // API終了を待つ
    await page.waitForResponse((res) => /\/api\/stats$/.test(res.url()) && res.status() === 200);

    await expect(page.getByText('test')).toBeVisible();
    await expect(page.locator('#count')).toHaveText('10');
    await expect(page.locator('#rate')).toHaveText('50%');
  });
});
