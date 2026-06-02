export interface FAQItem {
  id: string
  question: string
  answer: string
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'what-is-imagemark',
    question: 'What is ImageMark?',
    answer:
      'ImageMark is a free, open-source watermark tool for images. Add text or logo watermarks in your browser — no account, no uploads to our servers, no limits.',
  },
  {
    id: 'how-to-get-started',
    question: 'How do I get started?',
    answer:
      'Open the watermark tool, drag in your images (or click to choose files), set your text or logo, adjust position and style, then download. You can process many images at once and download them as a ZIP.',
  },
  {
    id: 'is-it-really-free',
    question: 'Is ImageMark really free?',
    answer:
      'Yes. ImageMark is free for everyone, forever. There are no subscriptions, credits, or paywalls. The project is open source — you can run it yourself or use imagemark.app.',
  },
  {
    id: 'privacy-security',
    question: 'Is my data private and secure?',
    answer:
      'Yes. All watermarking runs in your browser. Your images are not sent to ImageMark servers for processing. We do not store your files.',
  },
  {
    id: 'supported-formats',
    question: 'What image formats are supported?',
    answer: 'JPEG, PNG, GIF, WebP, BMP, TIFF, and SVG. Processing happens locally in your browser.',
  },
  {
    id: 'batch-processing',
    question: 'Can I watermark multiple images at once?',
    answer:
      'Yes. Upload as many images as you like, apply the same watermark settings to all of them, then download individually or as one ZIP file.',
  },
  {
    id: 'watermark-customization',
    question: 'How much can I customize my watermark?',
    answer:
      'Use text or a logo, pick from nine positions or set custom placement, and control size, opacity, rotation, font, and color.',
  },
  {
    id: 'image-quality',
    question: 'Will watermarking reduce image quality?',
    answer:
      'Watermarks are rendered at full resolution on a canvas. Your originals on disk are never modified — only the files you download are new exports.',
  },
  {
    id: 'no-account-needed',
    question: 'Do I need to create an account?',
    answer: 'No account, email, or sign-in. Open the site and start watermarking.',
  },
  {
    id: 'open-source',
    question: 'Is ImageMark open source?',
    answer:
      'Yes. The code is public on GitHub. You can contribute, report issues, or self-host the app for your team.',
  },
]
