import parser from '@typescript-eslint/parser';
import noAbbreviations from './scripts/checks/no_abbreviations.mjs';
import noSingleLineJsdoc from './scripts/checks/no_single_line_jsdoc.mjs';

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: { parser },
    plugins: {
      local: {
        rules: { ...noSingleLineJsdoc.rules, ...noAbbreviations.rules },
      },
    },
    rules: {
      'local/no-single-line-jsdoc': 'error',
      'local/no-abbreviations': ['error', { allow: ['hp'] }],
    },
  },
];
