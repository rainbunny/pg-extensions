module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'no-null'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'airbnb-base', 'prettier'],
  rules: {
    'no-null/no-null': 'error',
    'no-undef': 'off',
    'react/prop-types': 'off',
    'import/no-unresolved': ['error', {ignore: ['@lib']}],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/prefer-default-export': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    'import/no-extraneous-dependencies': ['error', {devDependencies: true}],
  },
  settings: {
    'import/resolver': {
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
    },
  },
};
