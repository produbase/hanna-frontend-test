import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'test-results/**', 'playwright-report/**', 'tmp/**'] },
  js.configs.recommended,
  { files: ['**/*.{js,jsx}'], languageOptions: { globals: { ...globals.browser, ...globals.node }, parserOptions: { ecmaFeatures: { jsx: true } } } },
  { files: ['src/**/*.jsx'], plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y }, rules: { ...reactHooks.configs.recommended.rules, ...jsxA11y.configs.recommended.rules, 'react/jsx-uses-vars': 'error', 'react/jsx-uses-react': 'error' } },
];
