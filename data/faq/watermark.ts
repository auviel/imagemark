import type { FAQItem } from '@/data/faq'

/**
 * Watermark-specific FAQ data
 * Tailored questions and answers for the watermark feature
 */
export const WATERMARK_FAQ_DATA: FAQItem[] = [
  {
    id: 'watermark-what-is',
    question: 'What is watermarking and why do I need it?',
    answer:
      'Watermarking adds text or logo overlays to your images and videos to protect your intellectual property, brand your content, or indicate ownership. It helps prevent unauthorized use of your work while maintaining your professional appearance.',
  },
  {
    id: 'watermark-how-to-use',
    question: 'How do I add a watermark to my images?',
    answer:
      "Simply upload your image or video, choose between a text or logo watermark, customize the position (9 preset positions or custom coordinates), adjust size, opacity, rotation, and style. Then click 'Apply Watermark' and download your protected content. It's that easy!",
  },
  {
    id: 'watermark-text-vs-logo',
    question: 'Can I use both text and logo watermarks?',
    answer:
      'Currently, you can use either a text watermark OR a logo watermark per image. Choose text for simple copyright notices or logo for brand protection. You can customize both with full control over position, size, opacity, and styling.',
  },
  {
    id: 'watermark-supported-formats',
    question: 'What file formats are supported?',
    answer:
      'We support JPEG, PNG, GIF, WebP, BMP, TIFF, and SVG for images, plus MP4, WebM, QuickTime (MOV), and AVI for videos. All processing happens in your browser, so your files never leave your device.',
  },
  {
    id: 'watermark-file-size-limits',
    question: 'Are there file size limits?',
    answer:
      'For images, there are no strict size limits, but very large files may take longer to process. For videos, we recommend files under 500MB for optimal performance. You can upload multiple files at once, and all processing happens in your browser.',
  },
  {
    id: 'watermark-multiple-files',
    question: 'Can I upload multiple files at once?',
    answer:
      'Yes! You can upload multiple images and videos simultaneously. Simply select multiple files when clicking "Choose Images or Videos" or drag and drop multiple files into the upload area. All files will be processed with the same watermark settings, and you can download them individually or as a ZIP file.',
  },
  {
    id: 'watermark-batch-processing',
    question: 'Can I watermark multiple files at once?',
    answer:
      'Yes! Upload multiple images or videos and apply the same watermark settings to all of them simultaneously. You can download individual files or get a convenient ZIP file with all your watermarked content.',
  },
  {
    id: 'watermark-positioning',
    question: 'How do I position my watermark?',
    answer:
      'You can choose from 9 preset positions (top-left, top-center, top-right, middle-left, center, middle-right, bottom-left, bottom-center, bottom-right) or set custom X/Y coordinates for pixel-perfect placement. You can also adjust rotation for diagonal watermarks.',
  },
  {
    id: 'watermark-customization',
    question: 'What can I customize about my watermark?',
    answer:
      'You have complete control! For text watermarks: font family, size, color, opacity, rotation, and position. For logo watermarks: size, opacity, rotation, and position. You can also adjust brightness and contrast to make your watermark stand out or blend in.',
  },
  {
    id: 'watermark-quality',
    question: 'Will watermarking reduce my image quality?',
    answer:
      'No! ImageMark preserves your original image quality while adding watermarks. We use high-quality rendering techniques to ensure your images look professional and crisp with watermarks applied. Your original files remain untouched.',
  },
  {
    id: 'watermark-privacy',
    question: 'Is my data private when watermarking?',
    answer:
      "Absolutely! All watermark processing happens entirely in your browser - your files never leave your device. We don't store, upload, or access your images or videos. Your privacy is our top priority, and you can use ImageMark with complete confidence.",
  },
  {
    id: 'watermark-video-support',
    question: 'Can I watermark videos?',
    answer:
      'Yes! ImageMark supports video watermarking for MP4, WebM, QuickTime, and AVI formats. The same customization options apply - you can add text or logo watermarks to your videos with full control over position, size, opacity, and styling.',
  },
  {
    id: 'watermark-removal',
    question: 'Can I remove a watermark after adding it?',
    answer:
      'Once a watermark is applied and you download the file, the watermark becomes part of the image or video. To remove it, you would need to use the original file. We recommend keeping your original files as backups before watermarking.',
  },
  {
    id: 'watermark-free',
    question: 'Is watermarking really free?',
    answer:
      'Yes! ImageMark watermarking is 100% free with no hidden costs, subscriptions, or usage limits. You can watermark as many images and videos as you want, completely free. No account required!',
  },
]
