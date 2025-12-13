import { test as base, expect, APIRequestContext } from '@playwright/test';

const test = base.extend<{
  authedAPI: APIRequestContext;
}>({
  authedAPI: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: process.env.BASE_URL!,
      storageState: '.auth/user10.json', // ログイン済み
    });
    await use(context);
    await context.dispose();
  },
});

export { test, expect };
