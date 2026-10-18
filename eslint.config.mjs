import typescriptEslint from 'typescript-eslint';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
  },
  {
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
    },
    languageOptions: {
      parser: typescriptEslint.parser,
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase'],
        },
      ],
      'no-empty': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      semi: 'warn',
    },
  },
];
