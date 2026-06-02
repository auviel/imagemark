# Contributing to ImageMark

**Built and managed by [Auviel](https://www.auviel.com)**

Thank you for contributing to ImageMark. This guide covers how to set up the project locally and submit changes.

## How to contribute

- **Report bugs** — Open a [GitHub issue](https://github.com/auviel/imagemark/issues) with steps to reproduce.
- **Suggest enhancements** — Open an issue to discuss ideas before large changes.
- **Submit pull requests** — Follow the setup and guidelines below.
- **Improve documentation** — README, FAQ, and inline docs are all welcome.

## Development setup

**Requirements:** Node.js 18+, npm

1. **Fork** the [ImageMark repository](https://github.com/auviel/imagemark) on GitHub.

2. **Clone** your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/imagemark.git
   cd imagemark
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Start the dev server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000/watermark](http://localhost:3000/watermark). No `.env` file is required for watermarking.

5. **Create a branch** for your changes:

   ```bash
   git checkout -b your-feature-name
   ```

6. **Verify your changes** before opening a PR:

   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```

7. **Commit and push**, then open a pull request against `main`.

## Where to make changes

Most watermark functionality lives under `features/watermark/`:

| Path                                    | Purpose                                  |
| --------------------------------------- | ---------------------------------------- |
| `app/watermark/`                        | Studio page and layout                   |
| `features/watermark/components/studio/` | Studio UI (sidebar, preview, file strip) |
| `features/watermark/hooks/`             | Upload and watermark processing          |
| `features/watermark/utils/`             | Canvas drawing, export, fonts            |
| `features/watermark/workers/`           | Background export worker                 |
| `components/ui/`                        | Shared UI primitives (Radix + Tailwind)  |

## Pull request guidelines

- Match the existing code style (TypeScript, Prettier, ESLint).
- Keep PRs focused — smaller changes are easier to review.
- Describe what changed and why in the PR body.
- Run `npm run lint` and `npm run type-check` before submitting.
- Avoid unrelated refactors in the same PR.

## Reporting bugs

Please include:

- **OS and browser** (e.g. macOS 15, Chrome 131)
- **Node.js version** (`node -v`)
- **Steps to reproduce**
- **Expected vs. actual behavior**
- **Screenshots or console errors** if relevant

## Suggesting enhancements

Please include:

- **Description** of the proposed change
- **Motivation** — what problem it solves
- **Use cases** — who benefits and how

Thank you for helping improve ImageMark!
