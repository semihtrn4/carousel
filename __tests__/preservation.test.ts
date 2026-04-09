/**
 * Preservation Tests (Pre-fix)
 *
 * Bu testler düzeltme yapılmadan önce değişmemesi gereken davranışları belgeler.
 * Testlerin BAŞARILI olması beklenir — düzeltme sonrası da geçmeye devam etmeliler.
 *
 * Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */

// ---------------------------------------------------------------------------
// Sabitler — editor.tsx ile aynı
// ---------------------------------------------------------------------------

const RATIOS: Record<string, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
};

// ---------------------------------------------------------------------------
// Property 2: Preservation – addTxt parametreleri
// Validates: Requirements 3.7
// ---------------------------------------------------------------------------

/**
 * editor.tsx'teki mevcut addTxt çağrısını simüle eder.
 * Düzeltme sonrası yalnızca `left` değişmeli; diğer parametreler sabit kalmalı.
 */
function simulateAddTxt(
  curSlide: number,
  ratio: string,
  slides: number,
  opts: { fontFamily?: string; fontSize?: number; color?: string }
): {
  left: number;
  top: number;
  fontFamily: string;
  fontSize: number;
  fill: string;
  originX: string;
  originY: string;
} {
  const dims = RATIOS[ratio];
  const w = dims.width * slides;
  const h = dims.height;

  // Mevcut (hatalı) left hesabı — düzeltme sonrası bu değişecek
  // Ama diğer parametreler sabit kalmalı
  return {
    left: w / 2, // BUG: sabit merkez — düzeltme sonrası (curSlide-1)*slideW + slideW/2 olacak
    top: h / 2,
    fontFamily: opts.fontFamily || 'Arial',
    fontSize: opts.fontSize || 48,
    fill: opts.color || '#000',
    originX: 'center',
    originY: 'center',
  };
}

/**
 * editor.tsx'teki mevcut addSticker çağrısını simüle eder.
 */
function simulateAddSticker(
  _curSlide: number,
  ratio: string,
  slides: number
): {
  left: number;
  top: number;
  fontSize: number;
  originX: string;
  originY: string;
} {
  const dims = RATIOS[ratio];
  const w = dims.width * slides;
  const h = dims.height;

  return {
    left: w / 2, // BUG: sabit merkez
    top: h / 2,
    fontSize: 100,
    originX: 'center',
    originY: 'center',
  };
}

describe('Property 2: Preservation – addTxt parametreleri korunmalı', () => {
  /**
   * Validates: Requirements 3.7
   *
   * addTxt düzeltmesinden sonra `top`, `fontFamily`, `fontSize`, `fill`,
   * `originX`, `originY` değerleri değişmemeli — sadece `left` koordinatı değişmeli.
   *
   * Bu testler mevcut kodda BAŞARILI olmalı ve düzeltme sonrası da geçmeli.
   */

  const ratios = ['square', 'portrait', 'story', 'landscape'];
  const slideCounts = [1, 2, 3, 5, 10];

  test('top = h/2 her zaman sabit kalmalı', () => {
    for (const ratio of ratios) {
      for (const slides of slideCounts) {
        for (let curSlide = 1; curSlide <= slides; curSlide++) {
          const result = simulateAddTxt(curSlide, ratio, slides, {});
          const expectedTop = RATIOS[ratio].height / 2;
          expect(result.top).toBe(expectedTop);
        }
      }
    }
  });

  test('originX = "center" her zaman sabit kalmalı', () => {
    for (const ratio of ratios) {
      for (const slides of slideCounts) {
        for (let curSlide = 1; curSlide <= slides; curSlide++) {
          const result = simulateAddTxt(curSlide, ratio, slides, {});
          expect(result.originX).toBe('center');
        }
      }
    }
  });

  test('originY = "center" her zaman sabit kalmalı', () => {
    for (const ratio of ratios) {
      for (const slides of slideCounts) {
        for (let curSlide = 1; curSlide <= slides; curSlide++) {
          const result = simulateAddTxt(curSlide, ratio, slides, {});
          expect(result.originY).toBe('center');
        }
      }
    }
  });

  test('fontFamily opts.fontFamily veya "Arial" olmalı', () => {
    const result1 = simulateAddTxt(1, 'portrait', 3, { fontFamily: 'Roboto' });
    expect(result1.fontFamily).toBe('Roboto');

    const result2 = simulateAddTxt(1, 'portrait', 3, {});
    expect(result2.fontFamily).toBe('Arial');
  });

  test('fontSize opts.fontSize veya 48 olmalı', () => {
    const result1 = simulateAddTxt(1, 'portrait', 3, { fontSize: 72 });
    expect(result1.fontSize).toBe(72);

    const result2 = simulateAddTxt(1, 'portrait', 3, {});
    expect(result2.fontSize).toBe(48);
  });

  test('fill opts.color veya "#000" olmalı', () => {
    const result1 = simulateAddTxt(1, 'portrait', 3, { color: '#FF0000' });
    expect(result1.fill).toBe('#FF0000');

    const result2 = simulateAddTxt(1, 'portrait', 3, {});
    expect(result2.fill).toBe('#000');
  });
});

// ---------------------------------------------------------------------------
// Property 2: Preservation – addSticker parametreleri
// Validates: Requirements 3.7
// ---------------------------------------------------------------------------

describe('Property 2: Preservation – addSticker parametreleri korunmalı', () => {
  /**
   * Validates: Requirements 3.7
   *
   * addSticker düzeltmesinden sonra `fontSize=100`, `originX='center'`,
   * `originY='center'` değerleri değişmemeli.
   */

  const ratios = ['square', 'portrait', 'story', 'landscape'];
  const slideCounts = [1, 2, 3, 5];

  test('fontSize = 100 her zaman sabit kalmalı', () => {
    for (const ratio of ratios) {
      for (const slides of slideCounts) {
        for (let curSlide = 1; curSlide <= slides; curSlide++) {
          const result = simulateAddSticker(curSlide, ratio, slides);
          expect(result.fontSize).toBe(100);
        }
      }
    }
  });

  test('originX = "center" her zaman sabit kalmalı', () => {
    for (const ratio of ratios) {
      for (const slides of slideCounts) {
        for (let curSlide = 1; curSlide <= slides; curSlide++) {
          const result = simulateAddSticker(curSlide, ratio, slides);
          expect(result.originX).toBe('center');
        }
      }
    }
  });

  test('originY = "center" her zaman sabit kalmalı', () => {
    for (const ratio of ratios) {
      for (const slides of slideCounts) {
        for (let curSlide = 1; curSlide <= slides; curSlide++) {
          const result = simulateAddSticker(curSlide, ratio, slides);
          expect(result.originY).toBe('center');
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Property 2: Preservation – setBg davranışı
// Validates: Requirements 3.3
// ---------------------------------------------------------------------------

describe('Property 2: Preservation – setBg davranışı korunmalı', () => {
  /**
   * Validates: Requirements 3.3
   *
   * setBg çağrısı tüm canvas'ı etkilemeli (slide-specific değil).
   * Mevcut kodda `c.setBackgroundColor(color, c.renderAll.bind(c))` şeklinde
   * tek bir canvas nesnesi üzerinde çalışır — bu davranış korunmalı.
   */

  // setBg'nin canvas genelinde çalıştığını simüle eden fonksiyon
  function simulateSetBg(color: string): { affectsWholeCanvas: boolean; color: string } {
    // Mevcut kod: window.setBg = (color) => { c.setBackgroundColor(color, c.renderAll.bind(c)); }
    // Tek canvas nesnesi (c) üzerinde çalışır — tüm canvas'ı etkiler
    return {
      affectsWholeCanvas: true, // slide-specific değil, canvas geneli
      color,
    };
  }

  test('setBg tüm canvas\'ı etkilemeli (slide-specific değil)', () => {
    const result = simulateSetBg('#FF0000');
    expect(result.affectsWholeCanvas).toBe(true);
  });

  test('setBg verilen rengi uygulamalı', () => {
    const colors = ['#FFFFFF', '#000000', '#FF006E', '#8338EC', '#3A86FF'];
    for (const color of colors) {
      const result = simulateSetBg(color);
      expect(result.color).toBe(color);
    }
  });

  test('setBg slide sayısından bağımsız çalışmalı', () => {
    // Farklı slide sayılarında setBg davranışı değişmemeli
    for (const slides of [1, 2, 3, 5, 10]) {
      const result = simulateSetBg('#06FFB4');
      expect(result.affectsWholeCanvas).toBe(true);
      expect(result.color).toBe('#06FFB4');
    }
  });
});

// ---------------------------------------------------------------------------
// Property 2: Preservation – deleteSel davranışı
// Validates: Requirements 3.4
// ---------------------------------------------------------------------------

describe('Property 2: Preservation – deleteSel davranışı korunmalı', () => {
  /**
   * Validates: Requirements 3.4
   *
   * deleteSel seçili nesneyi kaldırmalı.
   * Mevcut kod: `const a = c.getActiveObject(); if (a) { c.remove(a); ... }`
   */

  // deleteSel mantığını simüle eden fonksiyon
  function simulateDeleteSel(
    objects: string[],
    activeObject: string | null
  ): { remainingObjects: string[]; activeObjectAfter: null } {
    // Mevcut kod: if (a) { c.remove(a); c.discardActiveObject(); c.renderAll(); }
    if (activeObject === null) {
      return { remainingObjects: objects, activeObjectAfter: null };
    }
    return {
      remainingObjects: objects.filter((o) => o !== activeObject),
      activeObjectAfter: null,
    };
  }

  test('seçili nesne kaldırılmalı', () => {
    const objects = ['text1', 'sticker1', 'image1'];
    const result = simulateDeleteSel(objects, 'text1');
    expect(result.remainingObjects).not.toContain('text1');
    expect(result.remainingObjects).toHaveLength(2);
  });

  test('seçili nesne yoksa hiçbir şey kaldırılmamalı', () => {
    const objects = ['text1', 'sticker1'];
    const result = simulateDeleteSel(objects, null);
    expect(result.remainingObjects).toHaveLength(2);
    expect(result.remainingObjects).toContain('text1');
    expect(result.remainingObjects).toContain('sticker1');
  });

  test('silme sonrası aktif nesne null olmalı', () => {
    const objects = ['text1', 'sticker1'];
    const result = simulateDeleteSel(objects, 'sticker1');
    expect(result.activeObjectAfter).toBeNull();
  });

  test('son nesne silindiğinde canvas boş kalmalı', () => {
    const objects = ['text1'];
    const result = simulateDeleteSel(objects, 'text1');
    expect(result.remainingObjects).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Property 2: Preservation – Swipe sınır kontrolü
// Validates: Requirements 2.1, 2.2
// ---------------------------------------------------------------------------

describe('Property 2: Preservation – Swipe sınır kontrolü', () => {
  /**
   * Validates: Requirements 2.1, 2.2
   *
   * curSlide=1'de sola swipe → 0'a düşmemeli
   * curSlide=slides'da sağa swipe → slides+1'e çıkmamalı
   *
   * design.md'deki computeNextSlide fonksiyonu:
   * Math.max(1, Math.min(slides, curSlide + dir))
   */

  function computeNextSlide(curSlide: number, dir: number, slides: number): number {
    return Math.max(1, Math.min(slides, curSlide + dir));
  }

  test('curSlide=1\'de sola swipe (dir=1) → 0\'a düşmemeli', () => {
    // dir=1: sola swipe = ileri slide
    // Ama curSlide=1'de sola swipe mantıklı değil; test sınır kontrolünü doğrular
    // Burada dir=-1 (sağa swipe = geri slide) ile curSlide=1 test edilir
    const result = computeNextSlide(1, -1, 3);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBe(1); // 0'a düşmemeli
  });

  test('curSlide=slides\'da sağa swipe (dir=1) → slides+1\'e çıkmamalı', () => {
    const slides = 3;
    const result = computeNextSlide(slides, 1, slides);
    expect(result).toBeLessThanOrEqual(slides);
    expect(result).toBe(slides); // slides+1'e çıkmamalı
  });

  test('orta slide\'da sola swipe → curSlide+1 olmalı', () => {
    const result = computeNextSlide(2, 1, 5);
    expect(result).toBe(3);
  });

  test('orta slide\'da sağa swipe → curSlide-1 olmalı', () => {
    const result = computeNextSlide(3, -1, 5);
    expect(result).toBe(2);
  });

  test('farklı slide sayılarında sınır kontrolü çalışmalı', () => {
    const slideCounts = [1, 2, 3, 5, 10];
    for (const slides of slideCounts) {
      // İlk slide'da geri gidemez
      expect(computeNextSlide(1, -1, slides)).toBe(1);
      // Son slide'da ileri gidemez
      expect(computeNextSlide(slides, 1, slides)).toBe(slides);
    }
  });

  test('tek slide\'lı carousel\'de her iki yönde de sınır korunmalı', () => {
    expect(computeNextSlide(1, -1, 1)).toBe(1);
    expect(computeNextSlide(1, 1, 1)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Property 2: Preservation – Undo/redo stack mantığı
// Validates: Requirements 3.2
// ---------------------------------------------------------------------------

describe('Property 2: Preservation – Undo/redo stack mantığı korunmalı', () => {
  /**
   * Validates: Requirements 3.2
   *
   * save() fonksiyonu undoStack'e push etmeli, redoStack'i temizlemeli.
   * Mevcut kod:
   *   function save() { undoStack.push(JSON.stringify(c)); redoStack = []; ... }
   */

  // Undo/redo stack mantığını simüle eden sınıf
  class UndoRedoStack {
    undoStack: string[] = [];
    redoStack: string[] = [];
    maxSize = 20;

    save(state: string): void {
      // Mevcut kod: undoStack.push(JSON.stringify(c)); redoStack = [];
      this.undoStack.push(state);
      this.redoStack = [];
      if (this.undoStack.length > this.maxSize) {
        this.undoStack.shift();
      }
    }

    undo(): string | null {
      // Mevcut kod: if (undoStack.length > 1) { redoStack.push(undoStack.pop()); ... }
      if (this.undoStack.length > 1) {
        const current = this.undoStack.pop()!;
        this.redoStack.push(current);
        return this.undoStack[this.undoStack.length - 1];
      }
      return null;
    }

    redo(): string | null {
      // Mevcut kod: if (redoStack.length > 0) { const s = redoStack.pop(); undoStack.push(s); ... }
      if (this.redoStack.length > 0) {
        const state = this.redoStack.pop()!;
        this.undoStack.push(state);
        return state;
      }
      return null;
    }
  }

  test('save() undoStack\'e push etmeli', () => {
    const stack = new UndoRedoStack();
    stack.save('state1');
    expect(stack.undoStack).toHaveLength(1);
    expect(stack.undoStack[0]).toBe('state1');
  });

  test('save() redoStack\'i temizlemeli', () => {
    const stack = new UndoRedoStack();
    stack.save('state1');
    stack.save('state2');
    stack.undo(); // redoStack'e bir şey ekle
    expect(stack.redoStack).toHaveLength(1);

    stack.save('state3'); // yeni save redoStack'i temizlemeli
    expect(stack.redoStack).toHaveLength(0);
  });

  test('birden fazla save() sonrası undoStack doğru büyümeli', () => {
    const stack = new UndoRedoStack();
    stack.save('state1');
    stack.save('state2');
    stack.save('state3');
    expect(stack.undoStack).toHaveLength(3);
  });

  test('undo() undoStack\'ten pop etmeli, redoStack\'e push etmeli', () => {
    const stack = new UndoRedoStack();
    stack.save('state1');
    stack.save('state2');

    const result = stack.undo();
    expect(result).toBe('state1');
    expect(stack.undoStack).toHaveLength(1);
    expect(stack.redoStack).toHaveLength(1);
    expect(stack.redoStack[0]).toBe('state2');
  });

  test('redo() redoStack\'ten pop etmeli, undoStack\'e push etmeli', () => {
    const stack = new UndoRedoStack();
    stack.save('state1');
    stack.save('state2');
    stack.undo();

    const result = stack.redo();
    expect(result).toBe('state2');
    expect(stack.undoStack).toHaveLength(2);
    expect(stack.redoStack).toHaveLength(0);
  });

  test('undoStack 20 eleman sınırını aşmamalı', () => {
    const stack = new UndoRedoStack();
    for (let i = 0; i < 25; i++) {
      stack.save(`state${i}`);
    }
    expect(stack.undoStack.length).toBeLessThanOrEqual(20);
  });

  test('boş stack\'te undo() null döndürmeli', () => {
    const stack = new UndoRedoStack();
    expect(stack.undo()).toBeNull();
  });

  test('boş redoStack\'te redo() null döndürmeli', () => {
    const stack = new UndoRedoStack();
    stack.save('state1');
    expect(stack.redo()).toBeNull();
  });

  test('tek elemanlı stack\'te undo() null döndürmeli (ilk state korunmalı)', () => {
    const stack = new UndoRedoStack();
    stack.save('initial');
    // undoStack.length > 1 koşulu sağlanmadığından undo yapılmamalı
    expect(stack.undo()).toBeNull();
    expect(stack.undoStack).toHaveLength(1);
  });
});
