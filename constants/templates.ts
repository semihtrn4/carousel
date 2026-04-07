export type Template = {
  id: string;
  name: string;
  category: 'minimal' | 'editorial' | 'scrapbook' | 'bold' | 'aesthetic';
  slides: number;
  ratio: 'square' | 'portrait' | 'story' | 'landscape';
  elements: Array<{ color: string }>;
};

export const TEMPLATES: Template[] = [
  { id: 'minimal-clean', name: 'Clean Lines', category: 'minimal', slides: 3, ratio: 'portrait', elements: [{ color: '#F5F5F0' }] },
  { id: 'minimal-mono', name: 'Monochrome', category: 'minimal', slides: 5, ratio: 'portrait', elements: [{ color: '#E8E8E8' }] },
  { id: 'editorial-mag', name: 'Magazine', category: 'editorial', slides: 4, ratio: 'portrait', elements: [{ color: '#1C1C1E' }] },
  { id: 'editorial-type', name: 'Typography', category: 'editorial', slides: 3, ratio: 'square', elements: [{ color: '#2C2C2E' }] },
  { id: 'scrapbook-pastel', name: 'Pastel Collage', category: 'scrapbook', slides: 6, ratio: 'portrait', elements: [{ color: '#FFD6E0' }] },
  { id: 'scrapbook-vintage', name: 'Vintage Cut', category: 'scrapbook', slides: 4, ratio: 'portrait', elements: [{ color: '#F4E4C1' }] },
  { id: 'bold-neon', name: 'Neon Pop', category: 'bold', slides: 3, ratio: 'portrait', elements: [{ color: '#FF006E' }] },
  { id: 'bold-contrast', name: 'High Contrast', category: 'bold', slides: 5, ratio: 'square', elements: [{ color: '#000000' }] },
  { id: 'aesthetic-soft', name: 'Soft Aesthetic', category: 'aesthetic', slides: 4, ratio: 'portrait', elements: [{ color: '#E8D5C4' }] },
  { id: 'aesthetic-dark', name: 'Dark Aesthetic', category: 'aesthetic', slides: 3, ratio: 'story', elements: [{ color: '#1A0A2E' }] },
];

export const STICKERS = [
  { id: 'sticker-01', emoji: '✨' },
  { id: 'sticker-02', emoji: '🌟' },
  { id: 'sticker-03', emoji: '💫' },
  { id: 'sticker-04', emoji: '⭐' },
  { id: 'sticker-05', emoji: '🌙' },
  { id: 'sticker-06', emoji: '☀️' },
  { id: 'sticker-07', emoji: '🌈' },
  { id: 'sticker-08', emoji: '🦋' },
  { id: 'sticker-09', emoji: '🌸' },
  { id: 'sticker-10', emoji: '🌺' },
  { id: 'sticker-11', emoji: '🍀' },
  { id: 'sticker-12', emoji: '🌿' },
  { id: 'sticker-13', emoji: '🎀' },
  { id: 'sticker-14', emoji: '🎉' },
  { id: 'sticker-15', emoji: '🎊' },
  { id: 'sticker-16', emoji: '💎' },
  { id: 'sticker-17', emoji: '🔥' },
  { id: 'sticker-18', emoji: '❤️' },
  { id: 'sticker-19', emoji: '🧡' },
  { id: 'sticker-20', emoji: '💛' },
  { id: 'sticker-21', emoji: '💚' },
  { id: 'sticker-22', emoji: '💙' },
  { id: 'sticker-23', emoji: '💜' },
  { id: 'sticker-24', emoji: '🖤' },
  { id: 'sticker-25', emoji: '🤍' },
  { id: 'sticker-26', emoji: '🌊' },
];

export const FONTS = [
  { id: 'font-arial', name: 'Arial', family: 'Arial, sans-serif' },
  { id: 'font-georgia', name: 'Georgia', family: 'Georgia, serif' },
  { id: 'font-courier', name: 'Courier', family: "'Courier New', monospace" },
  { id: 'font-impact', name: 'Impact', family: 'Impact, fantasy' },
  { id: 'font-palatino', name: 'Palatino', family: 'Palatino, serif' },
  { id: 'font-trebuchet', name: 'Trebuchet', family: "'Trebuchet MS', sans-serif" },
  { id: 'font-verdana', name: 'Verdana', family: 'Verdana, sans-serif' },
  { id: 'font-garamond', name: 'Garamond', family: 'Garamond, serif' },
  { id: 'font-futura', name: 'Futura', family: "Futura, 'Century Gothic', sans-serif" },
  { id: 'font-didot', name: 'Didot', family: "Didot, 'Bodoni MT', serif" },
  { id: 'font-optima', name: 'Optima', family: 'Optima, Candara, sans-serif' },
  { id: 'font-baskerville', name: 'Baskerville', family: "Baskerville, 'Times New Roman', serif" },
];
