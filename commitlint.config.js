module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['gateway', 'auth', 'accounts', 'transactions', 'ci', 'docker', 'monitoring', 'deps', 'root'],
    ],
    'subject-min-length': [2, 'always', 10],
    'subject-max-length': [2, 'always', 100],
  },
};
