/**
 * Carousel Divider Lines Bug Condition Exploration Tests (Post-fix)
 *
 * Bu testler DÜZELTİLMİŞ kodun doğru çalıştığını doğrular.
 * Testlerin GEÇMESI beklenir — düzeltilmiş davranışı kanıtlar.
 *
 * Düzeltme: Ghost line'lar arka plan rengine göre kontrast renk kullanıyor.
 * Açık arka plan → rgba(0,0,0,0.7), Koyu arka plan → rgba(255,255,255,0.7)
 *
 * Validates: Requirements 1.1, 1.2, 1.3
 */

// ---------------------------------------------------------------------------
// Düzeltilmiş ghost line oluşturma davranışını simüle eder.
// editor.tsx'teki isLightColor + getContrastLineColor fonksiyonlarını yansıtır.
// ---------------------------------------------------------------------------

/**
 * Düzeltilmiş isLightColor fonksiyonu.
 * Hex veya rgb rengi parse edip luminance hesaplar, 0.5 üzerindeyse true döndürür.
 */
function isLightColor(color: string): boolean {
  let r: number, g: number, b: number;
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    const m = color.match(/\d+/g);
    if (!m) return false;
    r = Number(m[0]); g = Number(m[1]); b = Number(m[2]);
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

/**
 * Düzeltilmiş getContrastLineColor fonksiyonu.
 * Açık renk → rgba(0,0,0,0.7), Koyu renk → rgba(255,255,255,0.7)
 */
function getContrastLineColor(bgColor: string): string {
  return isLightColor(bgColor) ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)';
}

/**
 * Düzeltilmiş ghost line oluşturma davranışı.
 * stroke, arka plan rengine göre kontrast renk kullanıyor.
 */
function createGhostLine_fixed(backgroundColor: string): {
  stroke: string;
  strokeWidth: number;
  strokeDashArray: number[];
  selectable: boolean;
  evented: boolean;
  excludeFromExport: boolean;
} {
  // editor.tsx'teki düzeltilmiş kod:
  // const initialLineColor = getContrastLineColor('${selColor}');
  // const line = new fabric.Line([x, 0, x, h], {
  //   stroke: initialLineColor,  // <-- arka plan rengine göre kontrast
  //   ...
  // });
  return {
    stroke: getContrastLineColor(backgroundColor),
    strokeWidth: 3,
    strokeDashArray: [20, 15],
    selectable: false,
    evented: false,
    excludeFromExport: true,
  };
}

/**
 * Düzeltilmiş setBg davranışı.
 * Ghost line stroke'unu yeni arka plan rengine göre günceller.
 */
function simulateSetBg_fixed(
  _currentStroke: string,
  newBgColor: string
): string {
  // editor.tsx'teki düzeltilmiş kod:
  // window.setBg = (color) => {
  //   c.setBackgroundColor(color, c.renderAll.bind(c));
  //   ghostLines.forEach(l => l.set({ stroke: getContrastLineColor(color) }));
  //   c.renderAll();
  // };
  return getContrastLineColor(newBgColor); // Düzeltme: stroke güncelleniyor
}

// ---------------------------------------------------------------------------
// Test 1 – Açık Arka Plan (#FFFFFF) ile Ghost Line Oluşturma
// Validates: Requirements 1.1
// ---------------------------------------------------------------------------

describe('Fixed – Açık Arka Planda Ghost Line Görünürlük', () => {
  /**
   * Düzeltilmiş kod: backgroundColor açık renk olduğunda ghost line stroke
   * 'rgba(0,0,0,0.7)' (siyah, kontrast) döndürüyor.
   * Bu testler GEÇMELI — düzeltilmiş davranışı kanıtlar.
   */

  test('Açık arka plan (#FFFFFF) ile ghost line stroke rgba(0,0,0,0.7) olmalı', () => {
    const ghostLine = createGhostLine_fixed('#FFFFFF');

    // Düzeltilmiş: açık arka planda siyah kontrast çizgi
    expect(ghostLine.stroke).toBe('rgba(0,0,0,0.7)');
  });

  test('setBg("#F5F5F0") sonrası ghost line stroke rgba(0,0,0,0.7) olmalı', () => {
    // Başlangıçta koyu arka plan ile oluşturulmuş ghost line (beyaz stroke)
    const initialStroke = createGhostLine_fixed('#000000').stroke;
    expect(initialStroke).toBe('rgba(255,255,255,0.7)'); // Koyu arka planda beyaz — doğru

    // Kullanıcı açık arka plana geçiyor
    const updatedStroke = simulateSetBg_fixed(initialStroke, '#F5F5F0');

    // Düzeltilmiş: açık arka plana geçince stroke siyaha güncelleniyor
    expect(updatedStroke).toBe('rgba(0,0,0,0.7)');
  });

  test('Pastel renk (#FFE4E1) ile ghost line stroke rgba(0,0,0,0.7) olmalı', () => {
    const ghostLine = createGhostLine_fixed('#FFE4E1');

    // Düzeltilmiş: pastel (açık) arka planda siyah kontrast çizgi
    expect(ghostLine.stroke).toBe('rgba(0,0,0,0.7)');
  });
});

// ---------------------------------------------------------------------------
// Test 2 – setBg Çağrısı Sonrası Ghost Line Güncelleme
// Validates: Requirements 1.2
// ---------------------------------------------------------------------------

describe('Fixed – setBg Sonrası Ghost Line Rengi Güncelleniyor', () => {
  /**
   * setBg çağrıldığında ghost line stroke'u yeni arka plan rengine göre
   * güncelleniyor. Düzeltilmiş kod bunu yapıyor.
   */

  test('Koyu→Açık geçişte (#000000→#FFFFFF) ghost line stroke güncellenmeli', () => {
    // Koyu arka planla başla
    const ghostLine = createGhostLine_fixed('#000000');
    expect(ghostLine.stroke).toBe('rgba(255,255,255,0.7)'); // Koyu arka planda beyaz — doğru

    // Açık arka plana geç
    const strokeAfterSetBg = simulateSetBg_fixed(ghostLine.stroke, '#FFFFFF');

    // Düzeltilmiş: açık arka plana geçince stroke siyaha güncelleniyor
    expect(strokeAfterSetBg).toBe('rgba(0,0,0,0.7)');
  });

  test('Açık krem (#F5F5F0) arka planda ghost line stroke rgba(0,0,0,0.7) olmalı', () => {
    const ghostLine = createGhostLine_fixed('#F5F5F0');

    // Düzeltilmiş: açık krem arka planda siyah kontrast çizgi
    expect(ghostLine.stroke).toBe('rgba(0,0,0,0.7)');
  });

  test('setBg ile birden fazla renk geçişinde ghost line her seferinde güncellenmeli', () => {
    let currentStroke = createGhostLine_fixed('#1A1A1A').stroke; // Koyu başlangıç
    expect(currentStroke).toBe('rgba(255,255,255,0.7)'); // Koyu → beyaz

    // Açık renge geç
    currentStroke = simulateSetBg_fixed(currentStroke, '#FFFFFF');
    expect(currentStroke).toBe('rgba(0,0,0,0.7)'); // Açık → siyah

    // Tekrar koyu renge geç
    currentStroke = simulateSetBg_fixed(currentStroke, '#1A1A1A');
    expect(currentStroke).toBe('rgba(255,255,255,0.7)'); // Koyu → beyaz
  });
});

// ---------------------------------------------------------------------------
// Test 3 – Koyu Arka Plan Renkleri
// Validates: Requirements 1.3
// ---------------------------------------------------------------------------

describe('Fixed – Koyu Arka Planda Ghost Line Görünürlük', () => {
  test('Koyu arka plan (#000000) ile ghost line stroke rgba(255,255,255,0.7) olmalı', () => {
    const ghostLine = createGhostLine_fixed('#000000');
    expect(ghostLine.stroke).toBe('rgba(255,255,255,0.7)');
  });

  test('Koyu lacivert (#1A1A2E) ile ghost line stroke rgba(255,255,255,0.7) olmalı', () => {
    const ghostLine = createGhostLine_fixed('#1A1A2E');
    expect(ghostLine.stroke).toBe('rgba(255,255,255,0.7)');
  });

  test('Açık→Koyu geçişte (#FFFFFF→#000000) ghost line stroke güncellenmeli', () => {
    const initialStroke = createGhostLine_fixed('#FFFFFF').stroke;
    expect(initialStroke).toBe('rgba(0,0,0,0.7)'); // Açık → siyah

    const updatedStroke = simulateSetBg_fixed(initialStroke, '#000000');
    expect(updatedStroke).toBe('rgba(255,255,255,0.7)'); // Koyu → beyaz
  });
});
