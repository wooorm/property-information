/**
 * @import {FlatXoConfig} from 'xo'
 */

/** @type {FlatXoConfig} */
const xoConfig = [
  {
    name: 'default',
    prettier: true,
    rules: {
      'import-x/order': 'off',
      'logical-assignment-operators': 'off',
      'no-bitwise': 'off',
      'require-unicode-regexp': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/prefer-string-replace-all': 'off'
    },
    space: true
  },
  {
    files: ['script/**/*.js', 'test.js'],
    rules: {
      'no-await-in-loop': 'off'
    }
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface']
    }
  }
]

export default xoConfig
