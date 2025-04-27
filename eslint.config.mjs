import nextPlugin from 'eslint-config-next';

export default [
  ...nextPlugin,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
];
