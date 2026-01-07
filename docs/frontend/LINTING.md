# Frontend Linting & Code Quality

**Status:** ✅ Configured  
**Last Updated:** 2026-01-07

---

## Overview

The frontend uses a comprehensive linting and formatting setup with:
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

---

## Tools

### ESLint
- **Version:** 9.39.1
- **Parser:** TypeScript ESLint
- **Plugins:**
  - `eslint-plugin-react-hooks` - React Hooks rules
  - `eslint-plugin-react-refresh` - Fast Refresh compatibility
  - `eslint-plugin-prettier` - Prettier integration
  - `@typescript-eslint/eslint-plugin` - TypeScript rules

### Prettier
- **Version:** Latest
- **Integration:** Via ESLint plugin
- **Config:** `.prettierrc`

### TypeScript
- **Version:** 5.9.3
- **Config:** `tsconfig.json`
- **Strict Mode:** Enabled

---

## NPM Scripts

### Linting

```bash
# Run ESLint (fails on warnings)
npm run lint

# Run ESLint and auto-fix issues
npm run lint:fix
```

### Formatting

```bash
# Format all files with Prettier
npm run format

# Check if files are formatted (CI)
npm run format:check
```

### Type Checking

```bash
# Run TypeScript type checker
npm run type-check
```

### Complete Validation

```bash
# Run all checks (type-check + lint + format)
npm run validate
```

---

## ESLint Rules

### TypeScript Rules

| Rule | Level | Description |
|------|-------|-------------|
| `@typescript-eslint/no-unused-vars` | warn | Unused variables (allows `_` prefix) |
| `@typescript-eslint/no-explicit-any` | warn | Avoid `any` type |
| `@typescript-eslint/no-non-null-assertion` | warn | Avoid `!` assertions |
| `@typescript-eslint/explicit-module-boundary-types` | off | Return types optional |

### React Rules

| Rule | Level | Description |
|------|-------|-------------|
| `react-hooks/rules-of-hooks` | error | Enforce Hooks rules |
| `react-hooks/exhaustive-deps` | warn | Check Hook dependencies |
| `react-refresh/only-export-components` | warn | Fast Refresh compatibility |

### General Rules

| Rule | Level | Description |
|------|-------|-------------|
| `no-console` | warn | Allow only `warn`, `error`, `debug` |
| `no-debugger` | warn | No debugger statements |
| `prefer-const` | warn | Use `const` when possible |
| `no-var` | error | No `var`, use `let`/`const` |
| `eqeqeq` | error | Always use `===` |
| `curly` | error | Always use braces |
| `no-duplicate-imports` | error | No duplicate imports |

---

## Prettier Configuration

```json
{
  "semi": true,              // Use semicolons
  "trailingComma": "es5",    // Trailing commas where valid in ES5
  "singleQuote": true,       // Use single quotes
  "printWidth": 100,         // Line width 100 characters
  "tabWidth": 2,             // 2 spaces per tab
  "useTabs": false,          // Use spaces, not tabs
  "arrowParens": "always",   // Always parentheses around arrow function params
  "endOfLine": "lf",         // Unix line endings
  "bracketSpacing": true,    // Spaces in object literals
  "jsxSingleQuote": false,   // Double quotes in JSX
  "proseWrap": "preserve"    // Don't wrap markdown
}
```

---

## IDE Integration

### VS Code

Install extensions:
- **ESLint** - `dbaeumer.vscode-eslint`
- **Prettier** - `esbenp.prettier-vscode`

Add to `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### WebStorm / IntelliJ

1. Go to **Settings** → **Languages & Frameworks** → **JavaScript** → **Prettier**
2. Enable **"On save"**
3. Go to **Settings** → **Languages & Frameworks** → **JavaScript** → **Code Quality Tools** → **ESLint**
4. Enable **"Automatic ESLint configuration"**
5. Enable **"Run eslint --fix on save"**

---

## Pre-commit Hooks (Optional)

To enforce linting before commits, install Husky:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
```

Create `.husky/pre-commit`:
```bash
#!/bin/sh
npm run lint-staged
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run validate
```

---

## Common Issues & Fixes

### Issue: "Unexpected use of 'any'"

**Fix:** Replace `any` with proper types:
```typescript
// ❌ Bad
const data: any = response.data;

// ✅ Good
const data: Book[] = response.data;
```

### Issue: "Missing dependencies in useEffect"

**Fix:** Add missing dependencies or use `useCallback`:
```typescript
// ❌ Bad
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId

// ✅ Good
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### Issue: "Forbidden non-null assertion"

**Fix:** Use optional chaining or proper null checks:
```typescript
// ❌ Bad
const name = user!.name;

// ✅ Good
const name = user?.name ?? 'Unknown';
```

### Issue: "Fast refresh only works when..."

**Fix:** Separate hooks and components:
```typescript
// ❌ Bad - hooks.ts
export const useAuth = () => { ... };
export const AuthProvider = () => { ... };

// ✅ Good - hooks.ts
export const useAuth = () => { ... };

// ✅ Good - AuthProvider.tsx
export const AuthProvider = () => { ... };
```

---

## Ignoring Rules

### Disable for one line
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = response;
```

### Disable for entire file
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
```

### Disable in config
Add to `eslint.config.js`:
```javascript
rules: {
  '@typescript-eslint/no-explicit-any': 'off',
}
```

---

## Current Linting Status

### Files Checked: 40+ TypeScript/TSX files

### Issues Found:
- **Errors:** 2
  - React Hooks violations in Navbar
- **Warnings:** 5
  - Non-null assertions (3)
  - Fast Refresh compatibility (2)

### Auto-Fixed:
- ✅ Formatting issues (indentation, spacing)
- ✅ Import ordering
- ✅ Semicolons
- ✅ Quote style

---

## Best Practices

### 1. Run linter before committing
```bash
npm run validate
```

### 2. Fix issues automatically when possible
```bash
npm run lint:fix
npm run format
```

### 3. Don't disable rules without good reason
- Document why you're disabling a rule
- Use inline comments for specific cases
- Avoid disabling rules globally

### 4. Keep dependencies updated
```bash
npm outdated
npm update
```

### 5. Review linter warnings
- Warnings are there for a reason
- Fix them or understand why they're safe to ignore
- Don't let warnings accumulate

---

## Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [React Hooks Rules](https://react.dev/reference/rules/rules-of-hooks)

---

**Maintained by:** Development Team  
**Questions?** Check the docs or ask in #frontend channel
