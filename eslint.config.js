import eslint from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import pluginOxlint from 'eslint-plugin-oxlint';
import pluginPrettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/'],
  },
  pluginPrettier,
  eslint.configs.recommended,
  tseslint.configs.recommended,
  pluginOxlint.configs['flat/recommended'],
  pluginOxlint.configs['flat/typescript'],
  pluginOxlint.configs['flat/import'],
  {
    files: ['.prettierrc.*', 'eslint.config.*'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    plugins: {
      import: pluginImport,
    },
    rules: {
      'arrow-body-style': ['warn', 'as-needed'],
      'object-shorthand': ['warn', 'properties'],
      '@typescript-eslint/no-explicit-any': 'off',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
    },
  },
);
