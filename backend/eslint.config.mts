export default {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    tsconfigRootDir: "./src/", // For Node.js 20.11+
    project: './tsconfig.eslint.json', // Point to the ESLint-specific config
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    "plugin: prettier/recommended",
  ],
  rules: {
    // Your custom rules here
    semi: "off",
    "@typescript-eslint/semi": ["error", "always"],
    "prettier/prettier": ["error", { semi: true }],
  },
  // Specify which files to lint
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js' // if you want to ignore JS files
  ]
};