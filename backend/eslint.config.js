export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        global: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-console': 'off',
      'no-undef': 'error',
      'semi': ['error', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'indent': ['warn', 2, { SwitchCase: 1 }],
      'comma-dangle': ['warn', 'never'],
      'no-trailing-spaces': 'warn',
      'eol-last': ['warn', 'always'],
      'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
      'object-curly-spacing': ['warn', 'always'],
      'array-bracket-spacing': ['warn', 'never'],
      'space-before-function-paren': ['warn', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }],
      'keyword-spacing': 'warn',
      'space-infix-ops': 'warn',
      'no-multi-spaces': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error'
    }
  },
  {
    ignores: [
      'node_modules/**',
      'uploads/**',
      'dist/**',
      'build/**',
      '*.min.js'
    ]
  }
];
