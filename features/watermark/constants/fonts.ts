import type { FontOption } from '../types/watermark'

export const FONT_OPTIONS: FontOption[] = [
  { name: 'Inter', family: 'Inter, sans-serif', category: 'Sans Serif' },
  { name: 'Roboto', family: 'Roboto, sans-serif', category: 'Sans Serif' },
  { name: 'Open Sans', family: "'Open Sans', sans-serif", category: 'Sans Serif' },
  { name: 'Lato', family: 'Lato, sans-serif', category: 'Sans Serif' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'Sans Serif' },
  { name: 'Poppins', family: 'Poppins, sans-serif', category: 'Sans Serif' },
  { name: 'Source Sans Pro', family: "'Source Sans Pro', sans-serif", category: 'Sans Serif' },
  { name: 'Arial', family: 'Arial, sans-serif', category: 'Sans Serif' },
  { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif', category: 'Sans Serif' },
  { name: 'Playfair Display', family: "'Playfair Display', serif", category: 'Serif' },
  { name: 'Merriweather', family: 'Merriweather, serif', category: 'Serif' },
  { name: 'Lora', family: 'Lora, serif', category: 'Serif' },
  { name: 'Crimson Text', family: "'Crimson Text', serif", category: 'Serif' },
  { name: 'Times New Roman', family: "'Times New Roman', Times, serif", category: 'Serif' },
  { name: 'Georgia', family: 'Georgia, serif', category: 'Serif' },
  { name: 'Fira Code', family: "'Fira Code', monospace", category: 'Monospace' },
  { name: 'Source Code Pro', family: "'Source Code Pro', monospace", category: 'Monospace' },
  { name: 'JetBrains Mono', family: "'JetBrains Mono', monospace", category: 'Monospace' },
  { name: 'Courier New', family: "'Courier New', Courier, monospace", category: 'Monospace' },
  { name: 'Bebas Neue', family: "'Bebas Neue', sans-serif", category: 'Display' },
  { name: 'Oswald', family: 'Oswald, sans-serif', category: 'Display' },
  { name: 'Anton', family: 'Anton, sans-serif', category: 'Display' },
  { name: 'Bangers', family: 'Bangers, cursive', category: 'Display' },
  { name: 'Impact', family: "Impact, 'Arial Black', sans-serif", category: 'Display' },
  { name: 'Dancing Script', family: "'Dancing Script', cursive", category: 'Script' },
  { name: 'Pacifico', family: 'Pacifico, cursive', category: 'Script' },
  { name: 'Great Vibes', family: "'Great Vibes', cursive", category: 'Script' },
]

export function getFontFamily(fontName: string): string {
  return FONT_OPTIONS.find((f) => f.name === fontName)?.family ?? 'Inter, sans-serif'
}
