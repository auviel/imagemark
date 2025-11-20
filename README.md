# ImageMark

**Built and managed by [Auviel](https://www.auviel.com)**

ImageMark is a free, modern web application for adding watermarks to images and videos. Protect your content with professional watermarks in seconds.

## Features

- **Text & Image Watermarks** - Add custom text or upload your logo
- **Video Support** - Watermark video files with the same ease as images
- **Batch Processing** - Process multiple files at once
- **Real-time Preview** - See your watermark before applying
- **Advanced Positioning** - Precise control over watermark placement
- **Privacy First** - All processing happens in your browser
- **Multiple Formats** - Support for JPEG, PNG, GIF, WebP, MP4, WebM, and more
- **Responsive Design** - Works perfectly on desktop and mobile

## Live Demo

Visit **[imagemark.app](https://imagemark.app)** to try it now!

## Installation

\`\`\`bash
git clone https://github.com/auviel/imagemark.git
cd imagemark
npm install
npm run dev
\`\`\`

## Environment Setup

1. **Copy the example environment file:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. **Edit `.env.local` and fill in your values:**
   - For basic development, you can leave most values as defaults
   - For image optimization features, you'll need a ShortPixel API key
   - See `.env.example` for all available options and documentation

3. **Required for production:**
   - `SHORTPIXEL_API_KEY` - For image optimization features
   - `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` - For rate limiting (Phase 3)
   - `NEXT_PUBLIC_SENTRY_DSN` - For error tracking (Phase 2)

**Note:** Never commit `.env.local` to version control. It's already in `.gitignore`.

## Technology Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives
- **Language**: TypeScript
- **Processing**: HTML5 Canvas API for image manipulation
- **Video**: FFmpeg.wasm for video processing

## Development

\`\`\`bash

# Install dependencies

npm install

# Start development server

npm run dev

# Build for production

npm run build

# Start production server

npm start

# Format code with Prettier

npm run format

# Check code formatting

npm run format:check

# Type check

npm run type-check

# Lint code

npm run lint
\`\`\`

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/auviel/imagemark/issues) page to report bugs or request features.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## About

Built with ❤️ by [Auviel](https://www.auviel.com) for protecting your digital content.
