module.exports = {
  extends: ['react-app', 'plugin:react-hooks/recommended', 'plugin:jsx-a11y/recommended'],
  plugins: ['react-hooks', 'jsx-a11y'],
  env: {
      browser: true,
      node: true
  },
  parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
  },
  overrides: [
      {
          parserOptions: {
              parser: '@typescript-eslint/parser',
          },
      }
  ]
}
