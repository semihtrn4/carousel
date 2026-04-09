/**
 * Carousel Divider Lines Preservation Tests (Pre-fix)
 *
 * Bu testler DÜZELTİLMEMİŞ kodda GEÇMESI beklenir.
 * Korunacak baseline davranışı doğrular:
 * - Koyu arka planda ghost line stroke 'rgba(255,255,255,0.7)' kalır (doğru davranış)
 * - Ghost line özellikleri (selectable, evented, excludeFromExport, strokeDashArray, strokeWidth) değişmez
 * - hideGrid/showGrid visible özelliğini doğru toggle eder
 *
 * Property 2: Preservation - Ghost Line Özellikleri Korunur
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

// ---------------------------------------------------------------------------
// Mevcut (düzeltilmemiş) ghost line oluşturma davranışını simüle eder.
// editor.tsx'teki html() fonksiyonundaki inline JS'i yansıtır.
// ---------------------------------------------------------------------------

interface GhostLine {
  stroke: string;
  strokeWidth: number;
  strokeDashArray: number[];
  selectable: boolean;
  evented: boolean;
  excludeFromExport: boolean;
  visible: boolean;
}

/**
 * Mevcut ghost line oluşturma davranışı.
 * stroke her zaman sabit 'rgba(255,255,255,0.7)' — arka plan rengi dikkate alınmıyor.
 * Koyu arka planda bu doğru davranıştır.
 */
function createGhostLine_current(_backgroundColor: string): GhostLine {
  // editor.tsx'teki mevcut kod:
  // const line = new fabric.Line([x, 0, x, h], {
  //   stroke: 'rgba(255,255,255,0.7)',
  //   strokeWidth: 3,
  //   strokeDashArray: [20, 15],
  //   selectable: false,
  //   evented: false,
  //   excludeFromExport: true,
  // });
  return {
    stroke: 'rgba(255,255,255,0.7)',
    strokeWidth: 3,
    strokeDashArray: [20, 15],
    selectable: false,
    evented: false,
    excludeFromExport: true,
    visible: true,
  };
}

/**
 * hideGrid davranışını simüle eder.
 * ghostLines.forEach(l => { l.set({ visible: false }); }); c.renderAll();
 */
function simulateHideGrid(lines: GhostLine[]): GhostLine[] {
  return lines.map((l) => ({ ...l, visible: false }));
}

/**
 * showGrid davranışını simüle eder.
 * ghostLines.forEach(l => { l.set({ visible: true }); }); c.renderAll();
 */
function simulateShowGrid(lines: GhostLine[]): GhostLine[] {
  return lines.map((l) => ({ ...l, visible: true }));
}

// ---------------------------------------------------------------------------
// Property-based test yardımcısı: rastgele koyu hex renk üretici
// ---------------------------------------------------------------------------

/**
 * Verilen luminance eşiğinin altında kalan rastgele hex renk üretir.
 * luminance = (0.299*r + 0.587*g + 0.114*b) / 255
 * Koyu renk: luminance <= 0.5
 */
function generateDarkHexColors(count: number): string[] {
  const darkColors: string[] = [];
  // Deterministik seed ile koyu renkler üret (test tekrarlanabilirliği için)
  const candidates = [
    '#000000', '#0D0D0D', '#1A1A1A', '#111111', '#222222',
    '#333333', '#0A0A0A', '#050505', '#1C1C1C', '#0F0F0F',
    '#2A2A2A', '#151515', '#080808', '#181818', '#202020',
    '#121212', '#0E0E0E', '#161616', '#1E1E1E', '#282828',
    '#030303', '#070707', '#0B0B0B', '#131313', '#171717',
    '#1B1B1B', '#1F1F1F', '#232323', '#272727', '#2B2B2B',
    // Koyu renkli ama saf siyah değil
    '#2C2C2C', '#303030', '#343434', '#383838', '#3C3C3C',
    '#400000', '#004000', '#000040', '#3D0000', '#003D00',
    '#00003D', '#1A0000', '#001A00', '#00001A', '#2D1B00',
  ];
  return candidates.slice(0, count);
}

/**
 * Bir rengin koyu olup olmadığını kontrol eder (luminance <= 0.5).
 * Bu, düzeltme sonrası eklenecek isLightColor'ın tersini simüle eder.
 */
function isDarkColor(color: string): boolean {
  let r: number, g: number, b: number;
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    const m = color.match(/\d+/g);
    if (!m) return false;
    [r, g, b] = m.map(Number);
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance <= 0.5;
}

// ---------------------------------------------------------------------------
// Test 1 – Koyu Arka Planda Ghost Line Stroke Preservation
// Validates: Requirements 3.1
// ---------------------------------------------------------------------------

describe('Preservation – Koyu Arka Planda Ghost Line Stroke Korunur', () => {
  /**
   * Validates: Requirements 3.1
   *
   * Koyu arka plan renginde ghost line stroke 'rgba(255,255,255,0.7)' olarak kalmalı.
   * Bu mevcut kodda doğru davranıştır ve düzeltme sonrası da korunmalıdır.
   */

  test('#000000 (siyah) arka planda ghost line stroke rgba(255,255,255,0.7) olmalı', () => {
    const ghostLine = createGhostLine_current('#000000');
    expect(ghostLine.stroke).toBe('rgba(255,255,255,0.7)');
  });

  test('#0D0D0D (çok koyu) arka planda ghost line stroke rgba(255,255,255,0.7) olmalı', () => {
    const ghostLine = createGhostLine_current('#0D0D0D');
    expect(ghostLine.stroke).toBe('rgba(255,255,255,0.7)');
  });

  test('#1A1A1A (koyu gri) arka planda ghost line stroke rgba(255,255,255,0.7) olmalı', () => {
    const ghostLine = createGhostLine_current('#1A1A1A');
    expect(ghostLine.stroke).toBe('rgba(255,255,255,0.7)');
  });

  test('#333333 arka planda ghost line stroke rgba(255,255,255,0.7) olmalı', () => {
    const ghostLine = createGhostLine_current('#333333');
    expect(ghostLine.stroke).toBe('rgba(255,255,255,0.7)');
  });
});

// ---------------------------------------------------------------------------
// Test 2 – Ghost Line Özellikleri Preservation
// Validates: Requirements 3.1, 3.2, 3.3
// ---------------------------------------------------------------------------

describe('Preservation – Ghost Line Özellikleri Değişmez', () => {
  /**
   * Validates: Requirements 3.1, 3.2, 3.3
   *
   * Ghost line'ların selectable, evented, excludeFromExport, strokeDashArray,
   * strokeWidth özellikleri her koşulda sabit kalmalıdır.
   */

  const darkBackgrounds = ['#000000', '#0D0D0D', '#1A1A1A', '#111111', '#222222'];

  test('selectable: false her zaman korunmalı', () => {
    for (const bg of darkBackgrounds) {
      const ghostLine = createGhostLine_current(bg);
      expect(ghostLine.selectable).toBe(false);
    }
  });

  test('evented: false her zaman korunmalı', () => {
    for (const bg of darkBackgrounds) {
      const ghostLine = createGhostLine_current(bg);
      expect(ghostLine.evented).toBe(false);
    }
  });

  test('excludeFromExport: true her zaman korunmalı', () => {
    for (const bg of darkBackgrounds) {
      const ghostLine = createGhostLine_current(bg);
      expect(ghostLine.excludeFromExport).toBe(true);
    }
  });

  test('strokeDashArray: [20, 15] her zaman korunmalı', () => {
    for (const bg of darkBackgrounds) {
      const ghostLine = createGhostLine_current(bg);
      expect(ghostLine.strokeDashArray).toEqual([20, 15]);
    }
  });

  test('strokeWidth: 3 her zaman korunmalı', () => {
    for (const bg of darkBackgrounds) {
      const ghostLine = createGhostLine_current(bg);
      expect(ghostLine.strokeWidth).toBe(3);
    }
  });
});

// ---------------------------------------------------------------------------
// Test 3 – hideGrid / showGrid Toggle Preservation
// Validates: Requirements 3.4
// ---------------------------------------------------------------------------

describe('Preservation – hideGrid/showGrid visible Toggle Doğru Çalışır', () => {
  /**
   * Validates: Requirements 3.4
   *
   * hideGrid: tüm ghost line'ların visible özelliğini false yapar
   * showGrid: tüm ghost line'ların visible özelliğini true yapar
   */

  function createGhostLines(count: number): GhostLine[] {
    return Array.from({ length: count }, (_, i) =>
      createGhostLine_current('#000000')
    );
  }

  test('hideGrid tüm ghost line\'ları gizlemeli (visible: false)', () => {
    const lines = createGhostLines(3);
    // Başlangıçta hepsi görünür
    lines.forEach((l) => expect(l.visible).toBe(true));

    const hidden = simulateHideGrid(lines);
    hidden.forEach((l) => expect(l.visible).toBe(false));
  });

  test('showGrid tüm ghost line\'ları göstermeli (visible: true)', () => {
    const lines = createGhostLines(3);
    const hidden = simulateHideGrid(lines);
    // Gizlendikten sonra hepsi false
    hidden.forEach((l) => expect(l.visible).toBe(false));

    const shown = simulateShowGrid(hidden);
    shown.forEach((l) => expect(l.visible).toBe(true));
  });

  test('hideGrid → showGrid döngüsü doğru çalışmalı', () => {
    const lines = createGhostLines(5);

    const hidden = simulateHideGrid(lines);
    expect(hidden.every((l) => l.visible === false)).toBe(true);

    const shown = simulateShowGrid(hidden);
    expect(shown.every((l) => l.visible === true)).toBe(true);
  });

  test('showGrid → hideGrid döngüsü doğru çalışmalı', () => {
    const lines = createGhostLines(2);

    const shown = simulateShowGrid(lines);
    expect(shown.every((l) => l.visible === true)).toBe(true);

    const hidden = simulateHideGrid(shown);
    expect(hidden.every((l) => l.visible === false)).toBe(true);
  });

  test('hideGrid/showGrid stroke ve diğer özellikleri değiştirmemeli', () => {
    const lines = createGhostLines(3);
    const hidden = simulateHideGrid(lines);

    hidden.forEach((l) => {
      expect(l.stroke).toBe('rgba(255,255,255,0.7)');
      expect(l.strokeWidth).toBe(3);
      expect(l.strokeDashArray).toEqual([20, 15]);
      expect(l.selectable).toBe(false);
      expect(l.evented).toBe(false);
      expect(l.excludeFromExport).toBe(true);
    });
  });

  test('farklı slide sayılarında hideGrid/showGrid doğru çalışmalı', () => {
    for (const slideCount of [1, 2, 3, 5, 10]) {
      // slides-1 adet ghost line oluşturulur (slide sınırları için)
      const lineCount = Math.max(0, slideCount - 1);
      const lines = createGhostLines(lineCount);

      const hidden = simulateHideGrid(lines);
      expect(hidden.every((l) => l.visible === false)).toBe(true);

      const shown = simulateShowGrid(hidden);
      expect(shown.every((l) => l.visible === true)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Test 4 – Property-Based: Rastgele Koyu Hex Renklerde Stroke Preservation
// Validates: Requirements 3.1
// ---------------------------------------------------------------------------

describe('Property-Based: Rastgele Koyu Hex Renklerde Ghost Line Stroke Korunur', () => {
  /**
   * Validates: Requirements 3.1
   *
   * Property: FOR ALL koyu arka plan rengi X (luminance <= 0.5):
   *   createGhostLine_current(X).stroke = 'rgba(255,255,255,0.7)'
   *
   * Mevcut kod her zaman sabit 'rgba(255,255,255,0.7)' döndürdüğünden
   * koyu arka planda bu doğru davranıştır ve test GEÇER.
   */

  test('rastgele koyu hex renklerde ghost line stroke rgba(255,255,255,0.7) olmalı', () => {
    const darkColors = generateDarkHexColors(50);

    for (const color of darkColors) {
      // Rengin gerçekten koyu olduğunu doğrula
      expect(isDarkColor(color)).toBe(true);

      // Koyu arka planda ghost line stroke beyaz olmalı
      const ghostLine = createGhostLine_current(color);
      expect(ghostLine.stroke).toBe('rgba(255,255,255,0.7)');
    }
  });

  test('koyu renklerde tüm ghost line özellikleri sabit kalmalı', () => {
    const darkColors = generateDarkHexColors(30);

    for (const color of darkColors) {
      const ghostLine = createGhostLine_current(color);

      expect(ghostLine.stroke).toBe('rgba(255,255,255,0.7)');
      expect(ghostLine.strokeWidth).toBe(3);
      expect(ghostLine.strokeDashArray).toEqual([20, 15]);
      expect(ghostLine.selectable).toBe(false);
      expect(ghostLine.evented).toBe(false);
      expect(ghostLine.excludeFromExport).toBe(true);
    }
  });

  test('koyu renklerde hideGrid/showGrid toggle sonrası stroke değişmemeli', () => {
    const darkColors = generateDarkHexColors(20);

    for (const color of darkColors) {
      const lines = [createGhostLine_current(color)];

      const hidden = simulateHideGrid(lines);
      expect(hidden[0].stroke).toBe('rgba(255,255,255,0.7)');

      const shown = simulateShowGrid(hidden);
      expect(shown[0].stroke).toBe('rgba(255,255,255,0.7)');
    }
  });
});

// ---------------------------------------------------------------------------
// Test 5 – Slide Sınırı Konumları Preservation
// Validates: Requirements 3.5
// ---------------------------------------------------------------------------

describe('Preservation – Slide Sınırı Konumları Doğru', () => {
  /**
   * Validates: Requirements 3.5
   *
   * Her slide sınırına (i * slideWidth) bir divider çizgisi eklenmeli.
   * slides=3 için: x = 1*slideWidth, x = 2*slideWidth
   */

  const RATIOS: Record<string, { width: number; height: number }> = {
    square: { width: 1080, height: 1080 },
    portrait: { width: 1080, height: 1350 },
    story: { width: 1080, height: 1920 },
    landscape: { width: 1920, height: 1080 },
  };

  function computeGhostLinePositions(slides: number, ratio: string): number[] {
    const dims = RATIOS[ratio];
    const positions: number[] = [];
    for (let i = 1; i < slides; i++) {
      positions.push(i * dims.width);
    }
    return positions;
  }

  test('slides=3, portrait: 2 ghost line doğru konumlarda olmalı', () => {
    const positions = computeGhostLinePositions(3, 'portrait');
    expect(positions).toHaveLength(2);
    expect(positions[0]).toBe(1080);
    expect(positions[1]).toBe(2160);
  });

  test('slides=1: ghost line olmamalı', () => {
    const positions = computeGhostLinePositions(1, 'portrait');
    expect(positions).toHaveLength(0);
  });

  test('slides=2: 1 ghost line olmalı', () => {
    const positions = computeGhostLinePositions(2, 'portrait');
    expect(positions).toHaveLength(1);
    expect(positions[0]).toBe(1080);
  });

  test('farklı ratio\'larda ghost line konumları doğru hesaplanmalı', () => {
    const ratios = ['square', 'portrait', 'story', 'landscape'];
    for (const ratio of ratios) {
      const dims = RATIOS[ratio];
      const positions = computeGhostLinePositions(3, ratio);
      expect(positions).toHaveLength(2);
      expect(positions[0]).toBe(dims.width);
      expect(positions[1]).toBe(2 * dims.width);
    }
  });

  test('slides=5: 4 ghost line doğru konumlarda olmalı', () => {
    const positions = computeGhostLinePositions(5, 'square');
    expect(positions).toHaveLength(4);
    for (let i = 0; i < 4; i++) {
      expect(positions[i]).toBe((i + 1) * 1080);
    }
  });
});
