/**
 * Canvas Redesign Bug Exploration Tests (Pre-fix)
 *
 * Bu testler DÜZELTİLMEMİŞ kodda hataların varlığını kanıtlar.
 * Testlerin BAŞARISIZ olması beklenir — başarısızlık hatanın varlığını kanıtlar.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 */

// ---------------------------------------------------------------------------
// Yardımcı: editor.tsx'teki html() fonksiyonunu simüle eder
// React Native bağımlılığı olmadan saf TypeScript olarak çalışır.
// ---------------------------------------------------------------------------

const RATIOS: Record<string, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
};

/**
 * editor.tsx'teki html() fonksiyonunu birebir yansıtan yardımcı.
 * Mevcut (hatalı) kodu simüle eder.
 */
function generateEditorHtml(
  ratio: string,
  slides: number,
  selColor: string
): string {
  const dims = RATIOS[ratio];
  const w = dims.width * slides;
  const h = dims.height;

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #1a1a1a; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow: hidden; }
#container { position: relative; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
.grid { position: absolute; top: 0; width: 2px; height: 100%; background: repeating-linear-gradient(to bottom, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 8px, transparent 8px, transparent 16px); pointer-events: none; }
canvas { display: block; }
</style>
</head>
<body>
<div id="container"><canvas id="c"></canvas></div>
<script>
const c = new fabric.Canvas('c', { width: ${w}, height: ${h}, backgroundColor: '${selColor}', preserveObjectStacking: true });
const cont = document.getElementById('container');
for (let i = 1; i < ${slides}; i++) { const line = document.createElement('div'); line.className = 'grid'; line.style.left = (i * ${dims.width}) + 'px'; cont.appendChild(line); }
const MOBILE_CONTROLS = { cornerColor: '#fff', cornerStrokeColor: '#333', borderColor: '#06FFB4', cornerSize: 20, transparentCorners: false, hasRotatingPoint: false };
let undoStack = [], redoStack = [];
function save() { undoStack.push(JSON.stringify(c)); redoStack = []; if (undoStack.length > 20) undoStack.shift(); }
c.on('object:added', save); c.on('object:modified', save); c.on('object:removed', save);
window.addImg = (src, targetLeft) => { fabric.Image.fromURL(src, (img) => { const scale = Math.min(800 / img.width, 600 / img.height); img.set({ left: targetLeft || (${w / 2}), top: ${h / 2} - (img.height * scale / 2), scaleX: scale, scaleY: scale, ...MOBILE_CONTROLS }); c.add(img); c.setActiveObject(img); c.renderAll(); }); };
window.addTxt = (txt, opts) => { const t = new fabric.Text(txt, { left: opts.left || ${w / 2}, top: ${h / 2}, fontFamily: opts.fontFamily || 'Arial', fontSize: opts.fontSize || 48, fill: opts.color || '#000', textAlign: 'center', originX: 'center', originY: 'center', ...MOBILE_CONTROLS }); c.add(t); c.setActiveObject(t); c.renderAll(); };
window.addSticker = (emoji, left) => { const t = new fabric.Text(emoji, { left: left || ${w / 2}, top: ${h / 2}, fontSize: 100, originX: 'center', originY: 'center', ...MOBILE_CONTROLS }); c.add(t); c.setActiveObject(t); c.renderAll(); };
window.setBg = (color) => { c.setBackgroundColor(color, c.renderAll.bind(c)); };
window.undo = () => { if (undoStack.length > 1) { redoStack.push(undoStack.pop()); const s = undoStack[undoStack.length - 1]; c.loadFromJSON(s, c.renderAll.bind(c)); } };
window.redo = () => { if (redoStack.length > 0) { const s = redoStack.pop(); undoStack.push(s); c.loadFromJSON(s, c.renderAll.bind(c)); } };
window.exportCanvas = () => { const data = c.toDataURL({ format: 'png', quality: 1, multiplier: 1 }); window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'export', data })); };
window.deleteSel = () => { const a = c.getActiveObject(); if (a) { c.remove(a); c.discardActiveObject(); c.renderAll(); } };
let touchStartX = 0;
let touchStartY = 0;
let isDragging = false;
let lastPinchDist = 0;
let isPinching = false;
document.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    isPinching = true;
    isDragging = false;
    lastPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
  } else {
    isPinching = false;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = false;
  }
});
document.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    isPinching = true;
    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    const obj = c.getActiveObject();
    if (obj && lastPinchDist > 0) {
      const ratio = dist / lastPinchDist;
      const newScaleX = Math.max(0.1, Math.min(10, (obj.scaleX || 1) * ratio));
      const newScaleY = Math.max(0.1, Math.min(10, (obj.scaleY || 1) * ratio));
      obj.set({ scaleX: newScaleX, scaleY: newScaleY });
      obj.setCoords();
      c.renderAll();
    }
    lastPinchDist = dist;
  } else if (!isPinching) {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (dx > 10 || dy > 10) isDragging = true;
  }
});
document.addEventListener('touchend', (e) => {
  if (isPinching) {
    if (e.touches.length < 2) {
      isPinching = false;
      lastPinchDist = 0;
      const obj = c.getActiveObject();
      if (obj) { c.fire('object:modified', { target: obj }); }
    }
    return;
  }
  if (!isDragging) return;
  const delta = e.changedTouches[0].clientX - touchStartX;
  const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
  const THRESHOLD = 50;
  if (Math.abs(delta) > THRESHOLD && Math.abs(delta) > dy) {
    const dir = delta < 0 ? 1 : -1;
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'slideChange', dir }));
  }
});
window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Test 1 – Canvas Ölçek (S1)
// Validates: Requirements 1.1
// ---------------------------------------------------------------------------

describe('Test 1 – Canvas Ölçek / scaleToFit (S1)', () => {
  /**
   * Bug Condition: html() çıktısında scaleToFit hesabı ve
   * container.style.transform uygulaması BULUNMAMALI.
   * Beklenen davranış: scaleToFit ve transform: scale içermeli.
   * Bu testler BAŞARISIZ olmalı — hata S1'in varlığını kanıtlar.
   */

  test('html() çıktısı scaleToFit içermeli → FAIL (mevcut kodda yok)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // Mevcut kodda scaleToFit hesabı yok → FAIL
    expect(html).toContain('scaleToFit');
  });

  test('html() çıktısı container.style.transform içermeli → FAIL (mevcut kodda yok)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // Mevcut kodda container transform uygulaması yok → FAIL
    expect(html).toContain('container.style.transform');
  });

  test('html() çıktısı transformOrigin içermeli → FAIL (mevcut kodda yok)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // Mevcut kodda transformOrigin yok → FAIL
    expect(html).toContain('transformOrigin');
  });
});

// ---------------------------------------------------------------------------
// Test 2 – İçerik Konumlandırma (S4)
// Validates: Requirements 1.4
// ---------------------------------------------------------------------------

describe('Test 2 – İçerik Konumlandırma / visibleCenterY (S4)', () => {
  /**
   * Bug Condition: addTxt fonksiyonunda top: h/2 sabit değeri kullanılıyor.
   * visibleCenterY hesabı BULUNMUYOR.
   * Bu testler BAŞARISIZ olmalı — hata S4'ün varlığını kanıtlar.
   */

  test('html() çıktısı visibleCenterY içermeli → FAIL (mevcut kodda yok)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // Mevcut kodda visibleCenterY yok, sabit h/2 kullanılıyor → FAIL
    expect(html).toContain('visibleCenterY');
  });

  test('html() çıktısı addTxt içinde window.innerHeight içermeli → FAIL (mevcut kodda yok)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // Mevcut kodda görünür alan hesabı yok → FAIL
    expect(html).toContain('window.innerHeight');
  });

  test('html() çıktısı addTxt içinde sabit top: h/2 değeri içeriyor (hata kanıtı)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // portrait, 3 slides: h = 1350, h/2 = 675
    // Mevcut kodda addTxt top değeri 675 (sabit) → PASS (hata var)
    expect(html).toContain('top: 675');
  });
});

// ---------------------------------------------------------------------------
// Test 3 – Canvas Zoom (S3)
// Validates: Requirements 1.3
// ---------------------------------------------------------------------------

describe('Test 3 – Canvas Zoom / canvasScale (S3)', () => {
  /**
   * Bug Condition: touchmove handler'ında canvas zoom için
   * container.style.transform güncellemesi BULUNMUYOR.
   * Mevcut kod yalnızca seçili nesneyi ölçeklendiriyor.
   * Bu testler BAŞARISIZ olmalı — hata S3'ün varlığını kanıtlar.
   */

  test('html() çıktısı canvasScale değişkeni içermeli → FAIL (mevcut kodda yok)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // Mevcut kodda canvasScale değişkeni yok → FAIL
    expect(html).toContain('canvasScale');
  });

  test('html() çıktısı touchmove içinde canvas zoom mantığı içermeli → FAIL (mevcut kodda yok)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // Mevcut touchmove sadece nesne ölçeklendiriyor, canvas zoom yok → FAIL
    // Beklenen: seçili nesne yoksa canvasScale güncellenmeli
    expect(html).toContain('canvasScale * ratio');
  });

  test('html() çıktısı touchmove içinde c.getActiveObject() kontrolü içeriyor (kısmi doğrulama)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // Mevcut kodda getActiveObject var ama canvas zoom yok
    // Bu PASS olur — nesne kontrolü var ama canvas zoom eksik
    expect(html).toContain('c.getActiveObject()');
  });
});

// ---------------------------------------------------------------------------
// Test 4 – Slide Sınır Çizgileri (S2)
// Validates: Requirements 1.2
// ---------------------------------------------------------------------------

describe('Test 4 – Slide Sınır Çizgileri / .grid CSS (S2)', () => {
  /**
   * Bug Condition: .grid CSS'inde width: 2px kullanılıyor (3px olmalı).
   * Opaklık da düşük (rgba(255,255,255,0.4), 0.8 olmalı).
   * Bu testler PASS olmalı — hata S2'nin varlığını kanıtlar.
   */

  test('html() çıktısı .grid için width: 2px içeriyor → PASS (hata var, 3px olmalı)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // Mevcut kodda 2px → PASS (hata kanıtı)
    expect(html).toContain('width: 2px');
  });

  test('html() çıktısı .grid için width: 3px içermemeli → PASS (hata var)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // Düzeltilmiş kodda 3px olmalı, mevcut kodda yok → PASS (hata kanıtı)
    expect(html).not.toContain('width: 3px');
  });

  test('html() çıktısı .grid için rgba(255,255,255,0.8) içermemeli → PASS (hata var, opaklık düşük)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // Mevcut kodda 0.4 opaklık var, 0.8 olmalı → PASS (hata kanıtı)
    expect(html).not.toContain('rgba(255,255,255,0.8)');
  });

  test('html() çıktısı .grid için rgba(255,255,255,0.4) içeriyor → PASS (düşük opaklık hatası)', () => {
    const html = generateEditorHtml('portrait', 3, '#F5F5F0');
    // Mevcut kodda 0.4 opaklık → PASS (hata kanıtı)
    expect(html).toContain('rgba(255,255,255,0.4)');
  });
});

// ---------------------------------------------------------------------------
// Test 5 – Export Sayısı (S5)
// Validates: Requirements 1.5
// ---------------------------------------------------------------------------

describe('Test 5 – Export Sayısı / imageWidth / slides formülü (S5)', () => {
  /**
   * Bug Condition: export.tsx'te imageWidth / slides formülü kullanılmıyor.
   * dims.width sabit değeri kullanılıyor.
   * Bu testler BAŞARISIZ olmalı — hata S5'in varlığını kanıtlar.
   */

  /**
   * export.tsx'teki mevcut (hatalı) crop mantığını simüle eder.
   * dims.width sabit değeri kullanılıyor, imageWidth / slides değil.
   */
  function simulateExport_buggy(
    slides: number,
    ratio: string,
    _imageActualWidth: number
  ): Array<{ originX: number; width: number }> {
    const dims = RATIOS[ratio];
    // Mevcut kod: dims.width sabit kullanıyor
    const crops: Array<{ originX: number; width: number }> = [];
    for (let i = 0; i < slides; i++) {
      crops.push({
        originX: i * dims.width,
        width: dims.width,
      });
    }
    return crops;
  }

  /**
   * Beklenen (düzeltilmiş) crop mantığı.
   * imageWidth / slides formülü kullanılıyor.
   */
  function simulateExport_fixed(
    slides: number,
    _ratio: string,
    imageActualWidth: number
  ): Array<{ originX: number; width: number }> {
    const cropW = imageActualWidth / slides;
    const crops: Array<{ originX: number; width: number }> = [];
    for (let i = 0; i < slides; i++) {
      crops.push({
        originX: i * cropW,
        width: cropW,
      });
    }
    return crops;
  }

  test('export.tsx imageWidth/slides formülü kullanmalı → FAIL (dims.width kullanıyor)', () => {
    // Gerçek canvas çıktısı 390px genişliğinde olabilir (ekran genişliği)
    // ama dims.width 1080px — bu yanlış crop üretir
    const imageActualWidth = 390; // WebView'dan gelen gerçek piksel genişliği
    const slides = 3;
    const ratio = 'portrait';

    const buggy = simulateExport_buggy(slides, ratio, imageActualWidth);
    const fixed = simulateExport_fixed(slides, ratio, imageActualWidth);

    // Hatalı kod: dims.width (1080) kullanıyor, gerçek genişlik (390) değil
    // Bu assertion BAŞARISIZ olmalı — crop genişlikleri farklı
    expect(buggy[0].width).toBe(fixed[0].width); // 1080 !== 130 → FAIL
  });

  test('export.tsx crop originX değerleri imageWidth bazlı olmalı → FAIL', () => {
    const imageActualWidth = 390;
    const slides = 3;
    const ratio = 'portrait';

    const buggy = simulateExport_buggy(slides, ratio, imageActualWidth);
    const fixed = simulateExport_fixed(slides, ratio, imageActualWidth);

    // Slide 2 için originX: buggy=1080, fixed=130 → FAIL
    expect(buggy[1].originX).toBe(fixed[1].originX); // 1080 !== 130 → FAIL
  });

  test('export.tsx tüm crop genişlikleri toplamı imageActualWidth olmalı → FAIL', () => {
    const imageActualWidth = 390;
    const slides = 3;
    const ratio = 'portrait';

    const buggy = simulateExport_buggy(slides, ratio, imageActualWidth);
    const totalBuggyWidth = buggy.reduce((sum, c) => sum + c.width, 0);

    // Hatalı kod: toplam = 3 * 1080 = 3240, gerçek genişlik 390 → FAIL
    expect(totalBuggyWidth).toBe(imageActualWidth); // 3240 !== 390 → FAIL
  });

  test('export.tsx 3 slide için 3 ayrı crop üretiyor → PASS (sayı doğru ama içerik yanlış)', () => {
    const imageActualWidth = 390;
    const slides = 3;
    const ratio = 'portrait';

    const buggy = simulateExport_buggy(slides, ratio, imageActualWidth);
    // Crop sayısı doğru (3), ama koordinatlar yanlış → PASS
    expect(buggy.length).toBe(slides);
  });
});
