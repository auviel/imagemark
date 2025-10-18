export interface FAQItem {
  id: string
  question: string
  answer: string
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: "how-to-add-watermark",
    question: "How do I add a watermark to my photos?",
    answer: "Simply upload your image, choose between text or image watermark, customize the position, size, and opacity, then download your watermarked image. The process takes just a few seconds!"
  },
  {
    id: "supported-formats",
    question: "What file formats are supported?",
    answer: "We support JPEG, PNG, GIF, WebP, BMP, TIFF, and SVG for images, plus MP4, WebM, QuickTime, and AVI for videos. All processing happens in your browser for maximum privacy."
  },
  {
    id: "data-security",
    question: "Is my data secure when using ImageMark?",
    answer: "Absolutely! All processing happens in your browser - your files never leave your device. We don't store, upload, or access your images or videos. Your privacy is our top priority."
  },
  {
    id: "video-watermarking",
    question: "Can I watermark videos?",
    answer: "Yes! ImageMark supports video watermarking with the same ease as images. Upload your video, add your watermark, and download the watermarked video file."
  },
  {
    id: "batch-processing",
    question: "Can I watermark multiple files at once?",
    answer: "Absolutely! Upload multiple images or videos and process them all at once. You can download individual files or get a ZIP file with all your watermarked content."
  },
  {
    id: "remove-watermark",
    question: "How do I remove a watermark?",
    answer: "ImageMark is designed to add watermarks, not remove them. If you need to remove a watermark, you would need specialized photo editing software. We focus on helping you protect your content with professional watermarks."
  },
  {
    id: "watermark-positioning",
    question: "Can I customize watermark position and style?",
    answer: "Yes! You have full control over watermark positioning (9 preset positions or custom coordinates), size, opacity, rotation, font selection, colors, and more. Create the perfect watermark for your needs."
  },
  {
    id: "free-usage",
    question: "Is ImageMark really free?",
    answer: "Yes, ImageMark is completely free with no hidden costs, subscriptions, or limits. We believe in providing powerful watermarking tools accessible to everyone."
  },
  {
    id: "mobile-compatible",
    question: "Does ImageMark work on mobile devices?",
    answer: "Yes! ImageMark is fully responsive and works perfectly on desktop, tablet, and mobile devices. The interface adapts to your screen size for the best experience."
  },
  {
    id: "watermark-quality",
    question: "Will watermarks affect my image quality?",
    answer: "ImageMark preserves your original image quality while adding professional watermarks. We use high-quality rendering to ensure your images look great with watermarks applied."
  }
]
