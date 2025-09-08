import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/coverage/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescript,
    },
    languageOptions: {
      parser: typescriptParser,
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        // React globals  
        React: 'readonly',
        // HTML Element types
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLParagraphElement: 'readonly',
        HTMLHeadingElement: 'readonly',
        Node: 'readonly',
        MouseEvent: 'readonly',
        URLSearchParams: 'readonly',
        RequestInit: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-undef': 'error',
      'no-unused-vars': 'off', // Let TypeScript handle this
    },
  },
];