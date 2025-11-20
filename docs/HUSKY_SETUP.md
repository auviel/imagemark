# Husky Git Hooks Setup

**Date**: January 2025  
**Status**: ✅ Implemented

---

## ✅ Implementation Complete

Husky and lint-staged have been successfully configured with:

- **Pre-commit hook**: Runs lint-staged on staged files before each commit
- **Pre-push hook**: Runs lint and build checks before pushing to remote

---

## 📋 What Was Set Up

### 1. **Husky Installation**

- Installed `husky` and `lint-staged` as dev dependencies
- Initialized Husky with `npx husky init`
- Added `prepare` script to `package.json` for automatic setup

### 2. **Pre-commit Hook**

Created `.husky/pre-commit` hook that runs:

```bash
npx lint-staged
```

### 3. **Pre-push Hook**

Created `.husky/pre-push` hook that runs:

```bash
npm run lint
npm run build
```

This ensures code quality and buildability before pushing to remote.

### 4. **Lint-staged Configuration**

Configured in `package.json` to run on staged files:

**For TypeScript/JavaScript files** (`*.{ts,tsx,js,jsx}`):

- ESLint with auto-fix
- Prettier formatting

**For other files** (`*.{json,md,mdx,css,html,yml,yaml,scss}`):

- Prettier formatting

---

## 🎯 How It Works

### Pre-commit Hook (Before Commit)

1. **Developer stages files** with `git add`
2. **Developer runs** `git commit`
3. **Husky triggers** the pre-commit hook
4. **lint-staged runs** on only the staged files:
   - Runs ESLint with auto-fix on TS/JS files
   - Runs Prettier on all configured file types
5. **If checks pass**: Commit proceeds
6. **If checks fail**: Commit is blocked, developer fixes issues and tries again

### Pre-push Hook (Before Push)

1. **Developer runs** `git push`
2. **Husky triggers** the pre-push hook
3. **Runs lint check**: `npm run lint`
4. **Runs build check**: `npm run build`
5. **If checks pass**: Push proceeds
6. **If checks fail**: Push is blocked, developer fixes issues and tries again

---

## 📁 Files Created/Modified

### Created:

- `.husky/pre-commit` - Pre-commit hook script
- `.husky/pre-push` - Pre-push hook script
- `.husky/_/` - Husky internal files

### Modified:

- `package.json` - Added:
  - `"prepare": "husky"` script
  - `lint-staged` configuration
  - `husky` and `lint-staged` dev dependencies

---

## 🧪 Testing the Setup

### Test the pre-commit hook:

1. **Make a small change** to a file:

   ```bash
   echo "// test" >> app/page.tsx
   ```

2. **Stage the file**:

   ```bash
   git add app/page.tsx
   ```

3. **Try to commit**:

   ```bash
   git commit -m "test: verify husky hook"
   ```

4. **Expected behavior**:
   - lint-staged runs on the staged file
   - ESLint and Prettier run automatically
   - If there are fixable issues, they're fixed and re-staged
   - Commit proceeds if all checks pass

### Test the pre-push hook:

1. **Make a commit** (if you haven't already):

   ```bash
   git commit -m "test: verify pre-push hook"
   ```

2. **Try to push**:

   ```bash
   git push
   ```

3. **Expected behavior**:
   - Lint check runs (`npm run lint`)
   - Build check runs (`npm run build`)
   - If both pass: Push proceeds
   - If either fails: Push is blocked

### Manual testing:

Run lint-staged manually:

```bash
npx lint-staged
```

---

## ⚙️ Configuration Details

### Lint-staged Configuration

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,mdx,css,html,yml,yaml,scss}": ["prettier --write"]
  }
}
```

**What this means**:

- **TypeScript/JavaScript files**: ESLint fixes issues, then Prettier formats
- **Other files**: Only Prettier formatting (no linting needed)

---

## 🔧 Customization

### Add More File Types

To add more file types to lint-staged:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,mdx,css,html,yml,yaml,scss}": ["prettier --write"],
    "*.{py}": ["black --check", "flake8"]
  }
}
```

### Skip Hooks (Not Recommended)

If you absolutely need to skip hooks (emergency only):

**Skip pre-commit hook**:

```bash
git commit --no-verify -m "emergency fix"
```

**Skip pre-push hook**:

```bash
git push --no-verify
```

**⚠️ Warning**: Only use `--no-verify` in emergencies. It bypasses all quality checks.

---

## 🚀 Benefits

1. **Consistent Code Quality**: All commits are automatically linted and formatted
2. **Faster Reviews**: No need to comment on formatting issues in PRs
3. **Prevents Bad Code**: Catches issues before they're committed or pushed
4. **Team Alignment**: Everyone uses the same formatting rules
5. **Only Staged Files**: Fast execution, only processes changed files
6. **Build Verification**: Ensures code builds successfully before pushing
7. **Prevents Broken Builds**: Catches build errors before they reach CI/CD

---

## 📊 Impact

**Before**:

- Inconsistent code formatting
- ESLint errors could be committed
- Manual formatting required
- Code review time wasted on style issues

**After**:

- ✅ Automatic formatting on commit
- ✅ ESLint errors fixed automatically
- ✅ Consistent code style across team
- ✅ Faster code reviews (focus on logic, not style)

---

## 🔍 Troubleshooting

### Hook Not Running

**Symptom**: Pre-commit hook doesn't run

**Solution**:

```bash
# Reinstall Husky
rm -rf .husky
npm install
npx husky init
```

### Permission Denied

**Symptom**: `Permission denied` when committing or pushing

**Solution**:

```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### ESLint Errors Not Fixed

**Symptom**: ESLint errors remain after commit

**Solution**:

- Check if errors are auto-fixable (some require manual fixes)
- Run `npm run lint` to see all errors
- Fix manually if needed

### Slow Commits

**Symptom**: Commits take too long

**Solution**:

- lint-staged only runs on staged files (should be fast)
- If still slow, check for large files or many staged files
- Consider excluding large files from linting

### Slow Pushes

**Symptom**: Pushes take too long (build takes time)

**Solution**:

- This is expected - build check ensures code compiles
- Build time depends on project size
- Consider using `--no-verify` only in emergencies (not recommended)
- Optimize build time if consistently slow

---

## 📚 References

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/lint-staged/lint-staged)
- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)

---

## ✅ Next Steps

1. **Team Onboarding**: Ensure all team members run `npm install` to set up hooks
2. **CI Integration**: Add lint/format checks to CI pipeline (redundancy)
3. **Documentation**: Add to CONTRIBUTING.md
4. **Monitor**: Watch for any issues in first week of use

---

**Status**: ✅ Complete and ready for use
