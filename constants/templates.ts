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

export type CutoutLetter = { id: string; letter: string; emoji: string };

export const CUTOUT_LETTERS: CutoutLetter[] = [
  { id: 'letter-A', letter: 'A', emoji: '🅰️' },
  { id: 'letter-B', letter: 'B', emoji: '🅱️' },
  { id: 'letter-C', letter: 'C', emoji: '🇨' },
  { id: 'letter-D', letter: 'D', emoji: '🇩' },
  { id: 'letter-E', letter: 'E', emoji: '🇪' },
  { id: 'letter-F', letter: 'F', emoji: '🇫' },
  { id: 'letter-G', letter: 'G', emoji: '🇬' },
  { id: 'letter-H', letter: 'H', emoji: '🇭' },
  { id: 'letter-I', letter: 'I', emoji: '🇮' },
  { id: 'letter-J', letter: 'J', emoji: '🇯' },
  { id: 'letter-K', letter: 'K', emoji: '🇰' },
  { id: 'letter-L', letter: 'L', emoji: '🇱' },
  { id: 'letter-M', letter: 'M', emoji: '🇲' },
  { id: 'letter-N', letter: 'N', emoji: '🇳' },
  { id: 'letter-O', letter: 'O', emoji: '🇴' },
  { id: 'letter-P', letter: 'P', emoji: '🇵' },
  { id: 'letter-Q', letter: 'Q', emoji: '🇶' },
  { id: 'letter-R', letter: 'R', emoji: '🇷' },
  { id: 'letter-S', letter: 'S', emoji: '🇸' },
  { id: 'letter-T', letter: 'T', emoji: '🇹' },
  { id: 'letter-U', letter: 'U', emoji: '🇺' },
  { id: 'letter-V', letter: 'V', emoji: '🇻' },
  { id: 'letter-W', letter: 'W', emoji: '🇼' },
  { id: 'letter-X', letter: 'X', emoji: '🇽' },
  { id: 'letter-Y', letter: 'Y', emoji: '🇾' },
  { id: 'letter-Z', letter: 'Z', emoji: '🇿' },
];

export type Frame = { id: string; name: string; platform: string; ratio: string; svg: string };

export const FRAMES: Frame[] = [
  {
    id: 'frame-ig-post',
    name: 'Instagram Post',
    platform: 'instagram',
    ratio: 'square',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080"><rect x="10" y="10" width="1060" height="1060" rx="20" ry="20" fill="none" stroke="white" stroke-width="8" stroke-dasharray="20,10"/><rect x="30" y="30" width="1020" height="1020" rx="15" ry="15" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="3"/></svg>`
  },
  {
    id: 'frame-ig-story',
    name: 'Instagram Story',
    platform: 'instagram',
    ratio: 'story',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920"><rect x="10" y="10" width="1060" height="1900" rx="40" ry="40" fill="none" stroke="white" stroke-width="8" stroke-dasharray="20,10"/><text x="540" y="1880" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="36" font-family="Arial">Instagram Story</text></svg>`
  },
  {
    id: 'frame-tiktok',
    name: 'TikTok',
    platform: 'tiktok',
    ratio: 'story',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920"><rect x="10" y="10" width="1060" height="1900" rx="20" ry="20" fill="none" stroke="#69C9D0" stroke-width="8"/><rect x="10" y="10" width="1060" height="1900" rx="20" ry="20" fill="none" stroke="#EE1D52" stroke-width="4" stroke-dasharray="30,15" opacity="0.7"/><text x="540" y="1880" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="36" font-family="Arial">TikTok</text></svg>`
  },
];

export type StickerCategory = { id: string; label: string; stickers: Array<{ id: string; emoji: string }> };

export const STICKER_CATEGORIES: StickerCategory[] = [
  { id: 'general', label: 'Genel', stickers: STICKERS },
  { id: 'nature', label: 'Doğa', stickers: [
    { id: 'nat-01', emoji: '🌵' }, { id: 'nat-02', emoji: '🌴' }, { id: 'nat-03', emoji: '🍄' },
    { id: 'nat-04', emoji: '🌾' }, { id: 'nat-05', emoji: '🌻' }, { id: 'nat-06', emoji: '🌹' },
    { id: 'nat-07', emoji: '🍁' }, { id: 'nat-08', emoji: '🌊' }, { id: 'nat-09', emoji: '🌋' },
    { id: 'nat-10', emoji: '🦁' }, { id: 'nat-11', emoji: '🐬' }, { id: 'nat-12', emoji: '🦋' },
  ]},
  { id: 'food', label: 'Yiyecek', stickers: [
    { id: 'food-01', emoji: '🍕' }, { id: 'food-02', emoji: '🍦' }, { id: 'food-03', emoji: '🧁' },
    { id: 'food-04', emoji: '🍩' }, { id: 'food-05', emoji: '🍣' }, { id: 'food-06', emoji: '🍔' },
    { id: 'food-07', emoji: '🥑' }, { id: 'food-08', emoji: '🍓' }, { id: 'food-09', emoji: '🧃' },
    { id: 'food-10', emoji: '☕' }, { id: 'food-11', emoji: '🍰' }, { id: 'food-12', emoji: '🌮' },
  ]},
  { id: 'mood', label: 'Duygu', stickers: [
    { id: 'mood-01', emoji: '😎' }, { id: 'mood-02', emoji: '🥹' }, { id: 'mood-03', emoji: '🫶' },
    { id: 'mood-04', emoji: '🥳' }, { id: 'mood-05', emoji: '😍' }, { id: 'mood-06', emoji: '🤩' },
    { id: 'mood-07', emoji: '🫠' }, { id: 'mood-08', emoji: '😴' }, { id: 'mood-09', emoji: '🤯' },
    { id: 'mood-10', emoji: '🫡' }, { id: 'mood-11', emoji: '🤭' }, { id: 'mood-12', emoji: '🥰' },
  ]},
];
