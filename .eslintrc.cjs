module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'airbnb-typescript/base'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json', 'cypress/tsconfig.json'],
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {},
  ignorePatterns: ['.eslintrc.cjs', 'old-src'],
};