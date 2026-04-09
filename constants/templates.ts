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
  // Yıldızlar & Işık
  { id: 'sticker-01', emoji: '✨' }, { id: 'sticker-02', emoji: '🌟' }, { id: 'sticker-03', emoji: '💫' },
  { id: 'sticker-04', emoji: '⭐' }, { id: 'sticker-05', emoji: '🌙' }, { id: 'sticker-06', emoji: '☀️' },
  { id: 'sticker-07', emoji: '🌈' }, { id: 'sticker-08', emoji: '⚡' }, { id: 'sticker-09', emoji: '🔥' },
  { id: 'sticker-10', emoji: '💥' }, { id: 'sticker-11', emoji: '🌊' }, { id: 'sticker-12', emoji: '❄️' },
  // Kalpler & Duygular
  { id: 'sticker-13', emoji: '❤️' }, { id: 'sticker-14', emoji: '🧡' }, { id: 'sticker-15', emoji: '💛' },
  { id: 'sticker-16', emoji: '💚' }, { id: 'sticker-17', emoji: '💙' }, { id: 'sticker-18', emoji: '💜' },
  { id: 'sticker-19', emoji: '🖤' }, { id: 'sticker-20', emoji: '🤍' }, { id: 'sticker-21', emoji: '💕' },
  { id: 'sticker-22', emoji: '💞' }, { id: 'sticker-23', emoji: '💓' }, { id: 'sticker-24', emoji: '💗' },
  { id: 'sticker-25', emoji: '💖' }, { id: 'sticker-26', emoji: '💝' }, { id: 'sticker-27', emoji: '💘' },
  { id: 'sticker-28', emoji: '💟' }, { id: 'sticker-29', emoji: '♥️' }, { id: 'sticker-30', emoji: '🫶' },
  // Çiçekler & Doğa
  { id: 'sticker-31', emoji: '🌸' }, { id: 'sticker-32', emoji: '🌺' }, { id: 'sticker-33', emoji: '🌻' },
  { id: 'sticker-34', emoji: '🌹' }, { id: 'sticker-35', emoji: '🌷' }, { id: 'sticker-36', emoji: '🌼' },
  { id: 'sticker-37', emoji: '🍀' }, { id: 'sticker-38', emoji: '🌿' }, { id: 'sticker-39', emoji: '🍃' },
  { id: 'sticker-40', emoji: '🍁' }, { id: 'sticker-41', emoji: '🌵' }, { id: 'sticker-42', emoji: '🌴' },
  { id: 'sticker-43', emoji: '🍄' }, { id: 'sticker-44', emoji: '🌾' }, { id: 'sticker-45', emoji: '🌋' },
  // Hayvanlar
  { id: 'sticker-46', emoji: '🦋' }, { id: 'sticker-47', emoji: '🐝' }, { id: 'sticker-48', emoji: '🦄' },
  { id: 'sticker-49', emoji: '🐬' }, { id: 'sticker-50', emoji: '🦁' }, { id: 'sticker-51', emoji: '🐯' },
  { id: 'sticker-52', emoji: '🦊' }, { id: 'sticker-53', emoji: '🐼' }, { id: 'sticker-54', emoji: '🐨' },
  { id: 'sticker-55', emoji: '🦋' }, { id: 'sticker-56', emoji: '🐙' }, { id: 'sticker-57', emoji: '🦋' },
  // Yiyecek & İçecek
  { id: 'sticker-58', emoji: '🍕' }, { id: 'sticker-59', emoji: '🍦' }, { id: 'sticker-60', emoji: '🧁' },
  { id: 'sticker-61', emoji: '🍩' }, { id: 'sticker-62', emoji: '🍣' }, { id: 'sticker-63', emoji: '🍔' },
  { id: 'sticker-64', emoji: '🥑' }, { id: 'sticker-65', emoji: '🍓' }, { id: 'sticker-66', emoji: '🧃' },
  { id: 'sticker-67', emoji: '☕' }, { id: 'sticker-68', emoji: '🍰' }, { id: 'sticker-69', emoji: '🌮' },
  { id: 'sticker-70', emoji: '🍜' }, { id: 'sticker-71', emoji: '🍿' }, { id: 'sticker-72', emoji: '🥐' },
  { id: 'sticker-73', emoji: '🍇' }, { id: 'sticker-74', emoji: '🍉' }, { id: 'sticker-75', emoji: '🍋' },
  // Yüzler & Duygular
  { id: 'sticker-76', emoji: '😎' }, { id: 'sticker-77', emoji: '🥹' }, { id: 'sticker-78', emoji: '🥳' },
  { id: 'sticker-79', emoji: '😍' }, { id: 'sticker-80', emoji: '🤩' }, { id: 'sticker-81', emoji: '🫠' },
  { id: 'sticker-82', emoji: '😴' }, { id: 'sticker-83', emoji: '🤯' }, { id: 'sticker-84', emoji: '🫡' },
  { id: 'sticker-85', emoji: '🤭' }, { id: 'sticker-86', emoji: '🥰' }, { id: 'sticker-87', emoji: '😂' },
  { id: 'sticker-88', emoji: '🤔' }, { id: 'sticker-89', emoji: '😏' }, { id: 'sticker-90', emoji: '🙃' },
  // Semboller & Objeler
  { id: 'sticker-91', emoji: '💎' }, { id: 'sticker-92', emoji: '🎀' }, { id: 'sticker-93', emoji: '🎉' },
  { id: 'sticker-94', emoji: '🎊' }, { id: 'sticker-95', emoji: '🎯' }, { id: 'sticker-96', emoji: '🎸' },
  { id: 'sticker-97', emoji: '🎨' }, { id: 'sticker-98', emoji: '📸' }, { id: 'sticker-99', emoji: '🎬' },
  { id: 'sticker-100', emoji: '🏆' }, { id: 'sticker-101', emoji: '👑' }, { id: 'sticker-102', emoji: '💍' },
  { id: 'sticker-103', emoji: '🌂' }, { id: 'sticker-104', emoji: '🕶️' }, { id: 'sticker-105', emoji: '👜' },
  // Seyahat & Yer
  { id: 'sticker-106', emoji: '✈️' }, { id: 'sticker-107', emoji: '🗺️' }, { id: 'sticker-108', emoji: '🏖️' },
  { id: 'sticker-109', emoji: '🏔️' }, { id: 'sticker-110', emoji: '🌍' }, { id: 'sticker-111', emoji: '🗼' },
  { id: 'sticker-112', emoji: '🏠' }, { id: 'sticker-113', emoji: '🌃' }, { id: 'sticker-114', emoji: '🌅' },
  // Spor & Aktivite
  { id: 'sticker-115', emoji: '⚽' }, { id: 'sticker-116', emoji: '🏀' }, { id: 'sticker-117', emoji: '🎾' },
  { id: 'sticker-118', emoji: '🏄' }, { id: 'sticker-119', emoji: '🧘' }, { id: 'sticker-120', emoji: '💪' },
  // Teknoloji & Sosyal Medya
  { id: 'sticker-121', emoji: '📱' }, { id: 'sticker-122', emoji: '💻' }, { id: 'sticker-123', emoji: '🎮' },
  { id: 'sticker-124', emoji: '🎧' }, { id: 'sticker-125', emoji: '📷' }, { id: 'sticker-126', emoji: '🎙️' },
  // Özel & Trend
  { id: 'sticker-127', emoji: '🫧' }, { id: 'sticker-128', emoji: '🪄' }, { id: 'sticker-129', emoji: '🫐' },
  { id: 'sticker-130', emoji: '🪸' }, { id: 'sticker-131', emoji: '🫶' }, { id: 'sticker-132', emoji: '🌊' },
  { id: 'sticker-133', emoji: '🪩' }, { id: 'sticker-134', emoji: '🫧' }, { id: 'sticker-135', emoji: '🌺' },
  { id: 'sticker-136', emoji: '🎭' }, { id: 'sticker-137', emoji: '🪐' }, { id: 'sticker-138', emoji: '🌌' },
  { id: 'sticker-139', emoji: '🦋' }, { id: 'sticker-140', emoji: '🌙' }, { id: 'sticker-141', emoji: '⭐' },
  { id: 'sticker-142', emoji: '🎪' }, { id: 'sticker-143', emoji: '🎠' }, { id: 'sticker-144', emoji: '🎡' },
  { id: 'sticker-145', emoji: '🎢' }, { id: 'sticker-146', emoji: '🎆' }, { id: 'sticker-147', emoji: '🎇' },
  { id: 'sticker-148', emoji: '🧨' }, { id: 'sticker-149', emoji: '🎑' }, { id: 'sticker-150', emoji: '🎋' },
];

export const FONTS = [
  { id: 'font-arial', name: 'Arial', family: 'Arial, sans-serif' },
  { id: 'font-roboto', name: 'Roboto', family: 'Roboto, sans-serif' },
  { id: 'font-montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif' },
  { id: 'font-oswald', name: 'Oswald', family: 'Oswald, sans-serif' },
  { id: 'font-playfair', name: 'Playfair', family: "'Playfair Display', serif" },
  { id: 'font-georgia', name: 'Georgia', family: 'Georgia, serif' },
  { id: 'font-courier', name: 'Courier', family: "'Courier New', monospace" },
  { id: 'font-impact', name: 'Impact', family: 'Impact, fantasy' },
  { id: 'font-trebuchet', name: 'Trebuchet', family: "'Trebuchet MS', sans-serif" },
  { id: 'font-verdana', name: 'Verdana', family: 'Verdana, sans-serif' },
  { id: 'font-baskerville', name: 'Baskerville', family: "Baskerville, 'Times New Roman', serif" },
  { id: 'font-palatino', name: 'Palatino', family: 'Palatino, serif' },
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

export type Frame = {
  id: string;
  name: string;
  platform: string;
  ratio: string;
  svg?: string;
  imageAsset?: string; // 'local' means use bundled asset
  color: string; // platform brand color for UI button
};

export const FRAMES: Frame[] = [
  // ── Instagram ──────────────────────────────────────────────────────────────
  {
    id: 'frame-ig-post',
    name: 'Instagram Post',
    platform: 'instagram',
    ratio: 'portrait',
    color: '#E1306C',
    imageAsset: 'local_124',
  },
  {
    id: 'frame-ig-story',
    name: 'IG Story',
    platform: 'instagram',
    ratio: 'story',
    color: '#E1306C',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="igStoryGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f09433"/>
          <stop offset="25%" style="stop-color:#e6683c"/>
          <stop offset="50%" style="stop-color:#dc2743"/>
          <stop offset="75%" style="stop-color:#cc2366"/>
          <stop offset="100%" style="stop-color:#bc1888"/>
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="1064" height="1904" rx="48" ry="48" fill="none" stroke="url(#igStoryGrad)" stroke-width="16"/>
      <rect x="28" y="28" width="1024" height="1864" rx="36" ry="36" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="4"/>
      <circle cx="540" cy="96" r="44" fill="none" stroke="url(#igStoryGrad)" stroke-width="6"/>
      <circle cx="540" cy="96" r="36" fill="rgba(0,0,0,0.4)"/>
      <text x="540" y="1880" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="32" font-family="Arial" font-weight="bold">INSTAGRAM STORY</text>
    </svg>`,
  },
  {
    id: 'frame-ig-carousel',
    name: 'IG Carousel',
    platform: 'instagram',
    ratio: 'square',
    color: '#E1306C',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080">
      <defs>
        <linearGradient id="igCarGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f09433"/>
          <stop offset="50%" style="stop-color:#dc2743"/>
          <stop offset="100%" style="stop-color:#bc1888"/>
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="1064" height="1064" rx="24" ry="24" fill="none" stroke="url(#igCarGrad)" stroke-width="12"/>
      <rect x="24" y="24" width="1032" height="1032" rx="16" ry="16" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="3"/>
      <rect x="900" y="900" width="140" height="140" rx="12" fill="rgba(0,0,0,0.5)"/>
      <text x="970" y="985" text-anchor="middle" fill="white" font-size="48" font-family="Arial" font-weight="bold">❐</text>
    </svg>`,
  },

  // ── TikTok ─────────────────────────────────────────────────────────────────
  {
    id: 'frame-tiktok',
    name: 'TikTok',
    platform: 'tiktok',
    ratio: 'story',
    color: '#010101',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920">
      <rect x="8" y="8" width="1064" height="1904" rx="24" ry="24" fill="none" stroke="#69C9D0" stroke-width="10"/>
      <rect x="18" y="18" width="1044" height="1884" rx="18" ry="18" fill="none" stroke="#EE1D52" stroke-width="6" stroke-dasharray="0"/>
      <rect x="28" y="28" width="1024" height="1864" rx="14" ry="14" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="3"/>
      <!-- TikTok logo shape hint -->
      <text x="540" y="1880" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-size="32" font-family="Arial" font-weight="bold" letter-spacing="6">TIKTOK</text>
      <!-- Side action bar hint -->
      <rect x="980" y="700" width="72" height="320" rx="36" fill="rgba(0,0,0,0.4)"/>
    </svg>`,
  },

  // ── Facebook ───────────────────────────────────────────────────────────────
  {
    id: 'frame-facebook-post',
    name: 'Facebook Post',
    platform: 'facebook',
    ratio: 'landscape',
    color: '#1877F2',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
      <rect x="8" y="8" width="1904" height="1064" rx="16" ry="16" fill="none" stroke="#1877F2" stroke-width="12"/>
      <rect x="24" y="24" width="1872" height="1032" rx="10" ry="10" fill="none" stroke="rgba(24,119,242,0.35)" stroke-width="4"/>
      <!-- Top bar -->
      <rect x="0" y="0" width="1920" height="80" rx="16" fill="rgba(24,119,242,0.15)"/>
      <circle cx="52" cy="40" r="24" fill="#1877F2"/>
      <text x="52" y="48" text-anchor="middle" fill="white" font-size="28" font-family="Arial" font-weight="bold">f</text>
      <text x="90" y="50" fill="rgba(255,255,255,0.7)" font-size="26" font-family="Arial">Facebook</text>
      <text x="960" y="1060" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="28" font-family="Arial" font-weight="bold">FACEBOOK POST</text>
    </svg>`,
  },
  {
    id: 'frame-facebook-story',
    name: 'FB Story',
    platform: 'facebook',
    ratio: 'story',
    color: '#1877F2',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920">
      <rect x="8" y="8" width="1064" height="1904" rx="40" ry="40" fill="none" stroke="#1877F2" stroke-width="14"/>
      <rect x="26" y="26" width="1028" height="1868" rx="30" ry="30" fill="none" stroke="rgba(24,119,242,0.3)" stroke-width="4"/>
      <rect x="0" y="0" width="1080" height="100" rx="40" fill="rgba(24,119,242,0.2)"/>
      <circle cx="60" cy="50" r="28" fill="#1877F2"/>
      <text x="60" y="60" text-anchor="middle" fill="white" font-size="32" font-family="Arial" font-weight="bold">f</text>
      <text x="540" y="1890" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="30" font-family="Arial" font-weight="bold">FACEBOOK STORY</text>
    </svg>`,
  },

  // ── Twitter / X ────────────────────────────────────────────────────────────
  {
    id: 'frame-twitter-post',
    name: 'X (Twitter)',
    platform: 'twitter',
    ratio: 'landscape',
    color: '#000000',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
      <rect x="8" y="8" width="1904" height="1064" rx="16" ry="16" fill="none" stroke="#ffffff" stroke-width="10"/>
      <rect x="24" y="24" width="1872" height="1032" rx="10" ry="10" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="3"/>
      <!-- X logo -->
      <rect x="0" y="0" width="1920" height="80" rx="16" fill="rgba(0,0,0,0.5)"/>
      <text x="48" y="56" fill="white" font-size="44" font-family="Arial" font-weight="bold">𝕏</text>
      <text x="960" y="1060" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="28" font-family="Arial" font-weight="bold">X · TWITTER</text>
    </svg>`,
  },
  {
    id: 'frame-twitter-square',
    name: 'X Square',
    platform: 'twitter',
    ratio: 'square',
    color: '#000000',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080">
      <rect x="8" y="8" width="1064" height="1064" rx="16" ry="16" fill="none" stroke="#ffffff" stroke-width="10"/>
      <rect x="24" y="24" width="1032" height="1032" rx="10" ry="10" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="3"/>
      <text x="540" y="1060" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="28" font-family="Arial" font-weight="bold">𝕏 · TWITTER</text>
    </svg>`,
  },

  // ── YouTube ────────────────────────────────────────────────────────────────
  {
    id: 'frame-youtube-thumb',
    name: 'YouTube Thumb',
    platform: 'youtube',
    ratio: 'landscape',
    color: '#FF0000',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
      <rect x="8" y="8" width="1904" height="1064" rx="16" ry="16" fill="none" stroke="#FF0000" stroke-width="14"/>
      <rect x="26" y="26" width="1868" height="1028" rx="10" ry="10" fill="none" stroke="rgba(255,0,0,0.3)" stroke-width="4"/>
      <!-- YouTube play button hint -->
      <rect x="820" y="440" width="280" height="200" rx="40" fill="rgba(255,0,0,0.7)"/>
      <polygon points="900,480 900,600 1020,540" fill="white"/>
      <text x="960" y="1060" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="28" font-family="Arial" font-weight="bold">YOUTUBE THUMBNAIL</text>
    </svg>`,
  },
  {
    id: 'frame-youtube-short',
    name: 'YouTube Short',
    platform: 'youtube',
    ratio: 'story',
    color: '#FF0000',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920">
      <rect x="8" y="8" width="1064" height="1904" rx="24" ry="24" fill="none" stroke="#FF0000" stroke-width="14"/>
      <rect x="26" y="26" width="1028" height="1868" rx="16" ry="16" fill="none" stroke="rgba(255,0,0,0.25)" stroke-width="4"/>
      <rect x="0" y="0" width="1080" height="90" rx="24" fill="rgba(255,0,0,0.2)"/>
      <rect x="460" y="24" width="160" height="44" rx="22" fill="#FF0000"/>
      <text x="540" y="54" text-anchor="middle" fill="white" font-size="22" font-family="Arial" font-weight="bold">Shorts</text>
      <text x="540" y="1890" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="30" font-family="Arial" font-weight="bold">YOUTUBE SHORTS</text>
    </svg>`,
  },

  // ── Pinterest ──────────────────────────────────────────────────────────────
  {
    id: 'frame-pinterest',
    name: 'Pinterest Pin',
    platform: 'pinterest',
    ratio: 'portrait',
    color: '#E60023',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350">
      <rect x="8" y="8" width="1064" height="1334" rx="24" ry="24" fill="none" stroke="#E60023" stroke-width="12"/>
      <rect x="24" y="24" width="1032" height="1302" rx="16" ry="16" fill="none" stroke="rgba(230,0,35,0.3)" stroke-width="4"/>
      <!-- Pinterest P badge -->
      <circle cx="540" cy="60" r="40" fill="#E60023"/>
      <text x="540" y="76" text-anchor="middle" fill="white" font-size="44" font-family="Georgia" font-weight="bold">P</text>
      <text x="540" y="1330" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="28" font-family="Arial" font-weight="bold">PINTEREST</text>
    </svg>`,
  },

  // ── LinkedIn ───────────────────────────────────────────────────────────────
  {
    id: 'frame-linkedin',
    name: 'LinkedIn Post',
    platform: 'linkedin',
    ratio: 'landscape',
    color: '#0A66C2',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
      <rect x="8" y="8" width="1904" height="1064" rx="16" ry="16" fill="none" stroke="#0A66C2" stroke-width="12"/>
      <rect x="24" y="24" width="1872" height="1032" rx="10" ry="10" fill="none" stroke="rgba(10,102,194,0.35)" stroke-width="4"/>
      <rect x="0" y="0" width="1920" height="80" rx="16" fill="rgba(10,102,194,0.2)"/>
      <!-- LinkedIn "in" logo -->
      <rect x="16" y="8" width="64" height="64" rx="10" fill="#0A66C2"/>
      <text x="48" y="56" text-anchor="middle" fill="white" font-size="36" font-family="Arial" font-weight="bold">in</text>
      <text x="96" y="52" fill="rgba(255,255,255,0.7)" font-size="26" font-family="Arial">LinkedIn</text>
      <text x="960" y="1060" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="28" font-family="Arial" font-weight="bold">LINKEDIN POST</text>
    </svg>`,
  },
  {
    id: 'frame-linkedin-square',
    name: 'LinkedIn Square',
    platform: 'linkedin',
    ratio: 'square',
    color: '#0A66C2',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080">
      <rect x="8" y="8" width="1064" height="1064" rx="16" ry="16" fill="none" stroke="#0A66C2" stroke-width="12"/>
      <rect x="24" y="24" width="1032" height="1032" rx="10" ry="10" fill="none" stroke="rgba(10,102,194,0.3)" stroke-width="4"/>
      <rect x="16" y="16" width="64" height="64" rx="10" fill="#0A66C2"/>
      <text x="48" y="64" text-anchor="middle" fill="white" font-size="36" font-family="Arial" font-weight="bold">in</text>
      <text x="540" y="1060" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="28" font-family="Arial" font-weight="bold">LINKEDIN</text>
    </svg>`,
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
