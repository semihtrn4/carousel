/**
 * Bug Exploration Tests (Pre-fix)
 *
 * Bu testler düzeltme yapılmadan önce hataların varlığını kanıtlar.
 * Testlerin BAŞARISIZ olması beklenir — başarısızlık hatanın varlığını kanıtlar.
 *
 * Validates: Requirements 5.1, 6.1, 2.1, 4.1
 */

// ---------------------------------------------------------------------------
// Yardımcı fonksiyonlar — editor.tsx'teki mevcut (hatalı) ve beklenen mantığı
// saf TypeScript olarak yansıtır; React Native bağımlılığı yoktur.
// ---------------------------------------------------------------------------

const RATIOS: Record<string, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
};

/**
 * BUGGY: editor.tsx'teki mevcut addTxt/addSticker davranışı.
 * `left: ${w / 2}` — toplam canvas genişliğinin yarısı, curSlide'dan bağımsız.
 */
function computeTargetLeft_buggy(
  _curSlide: number,
  ratio: string,
  slides: number
): number {
  const slideW = RATIOS[ratio].width;
  const totalW = slideW * slides;
  return totalW / 2; // BUG: sabit merkez, aktif slide dikkate alınmıyor
}

/**
 * FIXED (beklenen): Aktif slide'ın merkez koordinatı.
 * `(curSlide - 1) * slideWidth + slideWidth / 2`
 */
function computeTargetLeft_fixed(curSlide: number, ratio: string): number {
  const slideW = RATIOS[ratio].width;
  return (curSlide - 1) * slideW + slideW / 2;
}

// ---------------------------------------------------------------------------
// H5/H6 – Koordinat Testi
// Validates: Requirements 5.1, 6.1
// ---------------------------------------------------------------------------

describe('H5/H6 – Metin/Sticker Koordinat Hatası (Bug Exploration)', () => {
  /**
   * Property 1: Bug Condition
   * ∀ curSlide ∈ [1..slides], ∀ ratio → addTxt/addSticker left koordinatı
   * (curSlide-1)*slideWidth + slideWidth/2 olmalı.
   * Mevcut kod totalW/2 sabit değerini kullandığından bu testler BAŞARISIZ olmalı.
   */

  test('curSlide=3, portrait, slides=3: buggy=1620, expected=2700 → FAIL', () => {
    const buggy = computeTargetLeft_buggy(3, 'portrait', 3);
    const expected = computeTargetLeft_fixed(3, 'portrait');
    // Hata: buggy değer beklenen değere eşit DEĞİL
    // Bu assertion BAŞARISIZ olmalı — hatanın varlığını kanıtlar
    expect(buggy).toBe(expected); // 1620 !== 2700 → FAIL
  });

  test('curSlide=1, portrait, slides=3: buggy=1620, expected=540 → FAIL', () => {
    const buggy = computeTargetLeft_buggy(1, 'portrait', 3);
    const expected = computeTargetLeft_fixed(1, 'portrait');
    expect(buggy).toBe(expected); // 1620 !== 540 → FAIL
  });

  test('curSlide=2, portrait, slides=3: buggy=1620, expected=1620 → PASS (tesadüfen doğru)', () => {
    const buggy = computeTargetLeft_buggy(2, 'portrait', 3);
    const expected = computeTargetLeft_fixed(2, 'portrait');
    // Orta slide için tesadüfen doğru — bu test GEÇER
    expect(buggy).toBe(expected); // 1620 === 1620 → PASS
  });

  test('curSlide=1, square, slides=5: buggy=2700, expected=540 → FAIL', () => {
    const buggy = computeTargetLeft_buggy(1, 'square', 5);
    const expected = computeTargetLeft_fixed(1, 'square');
    expect(buggy).toBe(expected); // 2700 !== 540 → FAIL
  });

  test('curSlide=4, square, slides=5: buggy=2700, expected=3780 → FAIL', () => {
    const buggy = computeTargetLeft_buggy(4, 'square', 5);
    const expected = computeTargetLeft_fixed(4, 'square');
    expect(buggy).toBe(expected); // 2700 !== 3780 → FAIL
  });

  test('curSlide=1, story, slides=3: buggy=1620, expected=960 → FAIL', () => {
    const buggy = computeTargetLeft_buggy(1, 'story', 3);
    const expected = computeTargetLeft_fixed(1, 'story');
    expect(buggy).toBe(expected); // 1620 !== 960 → FAIL
  });
});

// ---------------------------------------------------------------------------
// H2 – Swipe Testi
// Validates: Requirements 2.1, 2.2
// ---------------------------------------------------------------------------

describe('H2 – Swipe Dinleyici Eksikliği (Bug Exploration)', () => {
  /**
   * editor.tsx'teki html() fonksiyonunun ürettiği HTML string'ini analiz eder.
   * WebView HTML'inde touchstart/touchend event listener'larının BULUNMADIĞINI doğrular.
   * Bu test BAŞARISIZ olmalı — dinleyici yok, bu hatanın varlığını kanıtlar.
   */

  // editor.tsx'teki html() fonksiyonunu simüle eden minimal versiyon
  function generateEditorHtml(ratio: string, slides: number, selColor: string): string {
    const dims = RATIOS[ratio];
    const w = dims.width * slides;
    const h = dims.height;

    return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
</head>
<body>
<div id="container"><canvas id="c"></canvas></div>
<script>
const c = new fabric.Canvas('c', { width: ${w}, height: ${h}, backgroundColor: '${selColor}', preserveObjectStacking: true });
let undoStack = [], redoStack = [];
function save() { undoStack.push(JSON.stringify(c)); redoStack = []; if (undoStack.length > 20) undoStack.shift(); }
c.on('object:added', save); c.on('object:modified', save); c.on('object:removed', save);
window.addImg = (src) => { fabric.Image.fromURL(src, (img) => { const scale = Math.min(800 / img.width, 600 / img.height); img.set({ left: ${w / 2} - (img.width * scale / 2), top: ${h / 2} - (img.height * scale / 2), scaleX: scale, scaleY: scale }); c.add(img); c.setActiveObject(img); c.renderAll(); }, { crossOrigin: 'anonymous' }); };
window.addTxt = (txt, opts) => { const t = new fabric.Text(txt, { left: ${w / 2}, top: ${h / 2}, fontFamily: opts.fontFamily || 'Arial', fontSize: opts.fontSize || 48, fill: opts.color || '#000', textAlign: 'center', originX: 'center', originY: 'center' }); c.add(t); c.setActiveObject(t); c.renderAll(); };
window.addSticker = (emoji) => { const t = new fabric.Text(emoji, { left: ${w / 2}, top: ${h / 2}, fontSize: 100, originX: 'center', originY: 'center' }); c.add(t); c.setActiveObject(t); c.renderAll(); };
window.setBg = (color) => { c.setBackgroundColor(color, c.renderAll.bind(c)); };
window.undo = () => { if (undoStack.length > 1) { redoStack.push(undoStack.pop()); const s = undoStack[undoStack.length - 1]; c.loadFromJSON(s, c.renderAll.bind(c)); } };
window.redo = () => { if (redoStack.length > 0) { const s = redoStack.pop(); undoStack.push(s); c.loadFromJSON(s, c.renderAll.bind(c)); } };
window.exportCanvas = () => { const data = c.toDataURL({ format: 'png', quality: 1, multiplier: 1 }); window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'export', data })); };
window.deleteSel = () => { const a = c.getActiveObject(); if (a) { c.remove(a); c.discardActiveObject(); c.renderAll(); } };
window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
</script>
</body>
</html>`;
  }

  test('HTML touchstart event listener içermeli → FAIL (dinleyici yok)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // Bu assertion BAŞARISIZ olmalı — touchstart dinleyici mevcut kodda yok
    expect(html).toContain('touchstart');
  });

  test('HTML touchend event listener içermeli → FAIL (dinleyici yok)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // Bu assertion BAŞARISIZ olmalı — touchend dinleyici mevcut kodda yok
    expect(html).toContain('touchend');
  });

  test('HTML slideChange postMessage içermeli → FAIL (mesaj gönderilmiyor)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // Bu assertion BAŞARISIZ olmalı — slideChange mesajı mevcut kodda yok
    expect(html).toContain('slideChange');
  });
});

// ---------------------------------------------------------------------------
// H4 – URI Testi
// Validates: Requirements 4.1
// ---------------------------------------------------------------------------

describe('H4 – file:// URI Base64 Dönüşümü Eksikliği (Bug Exploration)', () => {
  /**
   * editor.tsx'teki pickImg fonksiyonunu simüle eder.
   * Mevcut kod file:// URI'ını doğrudan inject eder, base64'e çevirmez.
   * Bu test BAŞARISIZ olmalı — base64 dönüşümü yapılmıyor.
   */

  // Mevcut (hatalı) pickImg davranışını simüle eden fonksiyon
  function simulatePickImg_buggy(uri: string): { injectedUri: string; isBase64: boolean } {
    // Mevcut kod: webRef.current?.injectJavaScript(`window.addImg('${res.assets[0].uri}'); true;`)
    // Hiçbir dönüşüm yapılmıyor, URI doğrudan kullanılıyor
    return {
      injectedUri: uri,
      isBase64: uri.startsWith('data:'),
    };
  }

  test('file:// URI base64 data URI olarak inject edilmeli → FAIL (dönüşüm yok)', () => {
    const fileUri = 'file:///data/user/0/com.example/cache/image.jpg';
    const result = simulatePickImg_buggy(fileUri);

    // Bu assertion BAŞARISIZ olmalı — mevcut kod base64'e çevirmiyor
    expect(result.isBase64).toBe(true); // false → FAIL
  });

  test('inject edilen URI data:image formatında olmalı → FAIL', () => {
    const fileUri = 'file:///data/user/0/com.example/cache/image.jpg';
    const result = simulatePickImg_buggy(fileUri);

    // Bu assertion BAŞARISIZ olmalı
    expect(result.injectedUri).toMatch(/^data:image\//); // file:// → FAIL
  });

  test('inject edilen URI file:// ile başlamamalı → FAIL', () => {
    const fileUri = 'file:///data/user/0/com.example/cache/image.jpg';
    const result = simulatePickImg_buggy(fileUri);

    // Bu assertion BAŞARISIZ olmalı — file:// URI WebView'da cross-origin hatası verir
    expect(result.injectedUri.startsWith('file://')).toBe(false); // true → FAIL
  });
});

// ---------------------------------------------------------------------------
// Özet: Beklenen test sonuçları
// ---------------------------------------------------------------------------
// H5/H6 Koordinat:
//   - curSlide=3, portrait: FAIL (1620 !== 2700)
//   - curSlide=1, portrait: FAIL (1620 !== 540)
//   - curSlide=2, portrait: PASS (1620 === 1620, tesadüfen doğru)
//   - curSlide=1, square, slides=5: FAIL (2700 !== 540)
//   - curSlide=4, square, slides=5: FAIL (2700 !== 3780)
//   - curSlide=1, story: FAIL (1620 !== 960)
//
// H2 Swipe:
//   - touchstart: FAIL (dinleyici yok)
//   - touchend: FAIL (dinleyici yok)
//   - slideChange: FAIL (mesaj yok)
//
// H4 URI:
//   - isBase64: FAIL (dönüşüm yok)
//   - data:image format: FAIL
//   - file:// başlamamalı: FAIL
