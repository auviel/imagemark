import type { FAQItem } from '@/data/faq'

export const WATERMARK_FAQ_DATA: FAQItem[] = [
  {
    id: 'watermark-supported-formats',
    question: 'What image formats are supported?',
    answer:
      'JPEG, PNG, GIF, WebP, BMP, TIFF, and SVG. Everything is processed in your browser — files never leave your device.',
  },
  {
    id: 'watermark-multiple-files',
    question: 'Can I upload multiple images at once?',
    answer:
      'Yes. Drag and drop many files or use the file picker. The same watermark settings apply to all images. Download one by one or as a ZIP.',
  },
  {
    id: 'watermark-what-is',
    question: 'Why watermark images?',
    answer:
      'Watermarks help protect your work, show ownership, and keep your brand visible when images are shared online.',
  },
  {
    id: 'watermark-text-vs-logo',
    question: 'Text or logo watermark?',
    answer:
      'Use text for copyright lines or captions. Upload a PNG logo for brand marks. Customize position, size, opacity, and rotation for either.',
  },
  {
    id: 'watermark-privacy',
    question: 'Are my images uploaded to a server?',
    answer:
      'No. ImageMark runs entirely in your browser. We do not receive your image files for watermarking.',
  },
  {
    id: 'watermark-free',
    question: 'Is it free?',
    answer: 'Completely free — no limits, no account, no paid tier.',
  },
]
