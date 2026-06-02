# ImageMark

**Built by [Auviel](https://www.auviel.com)** · [Live app](https://imagemark.app) · [GitHub](https://github.com/auviel/imagemark)

Free, open-source **image watermarking** that runs entirely in your browser. Add text or logo watermarks to one file or hundreds — no account, no server uploads, no limits.

## Why ImageMark

- **Private** — Your images are processed on your device, not on our servers
- **Simple** — Upload, set watermark, download (batch + ZIP supported)
- **Free** — For everyone, forever; MIT licensed

## Features

- Text and logo watermarks
- Nine position presets plus custom placement
- Opacity, size, rotation, fonts, and colors
- Batch upload and ZIP download
- Real-time preview

## Quick start

```bash
git clone https://github.com/auviel/imagemark.git
cd imagemark
npm install
npm run dev
```

Open [http://localhost:3000/watermark](http://localhost:3000/watermark).

No API keys are required for watermarking. Optional env vars in `.env.example` are only for legacy or self-hosted extras — the core tool does not need them.

## Tech stack

- Next.js · React · TypeScript
- Tailwind CSS · Radix UI
- HTML5 Canvas (all image watermarking)

## Scripts

```bash
npm run dev          # development
npm run build        # production build
npm run start        # production server
npm run lint         # ESLint
npm run type-check   # TypeScript
```

## Contributing

Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports and ideas: [GitHub Issues](https://github.com/auviel/imagemark/issues).

## License

MIT — see [LICENSE](LICENSE).
