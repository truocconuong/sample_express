module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-console': 0,
    'func-names': 0,
    'no-async-promise-executor': 0,
    'prefer-const': 0,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  env: {
    es2020: true,
  },
};
