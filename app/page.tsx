import { redirect } from 'next/navigation'

/** Home opens the watermark tool directly. FAQ lives at /faq. */
export default function HomePage() {
  redirect('/watermark')
}
