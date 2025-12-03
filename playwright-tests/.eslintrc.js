module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    // ここに好みのルールを追加できるよ（最初は空でOK）
  },
  ignorePatterns: ["node_modules", "dist", "test-results", "playwright-report"],
};
