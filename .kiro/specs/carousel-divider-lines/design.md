# Carousel Divider Lines Bugfix Design

## Overview

`app/editor.tsx` içindeki Fabric.js canvas'ta, birden fazla slide arasındaki sınırları gösteren
ghost line (divider) çizgileri her zaman sabit beyaz renkte (`rgba(255,255,255,0.7)`) çizilmektedir.
Canvas arka planı açık renk olduğunda bu çizgiler görünmez hale gelir.

Düzeltme yaklaşımı: Canvas arka plan renginin parlaklığını (luminance) hesaplayarak kontrast renk
belirleyen bir yardımcı fonksiyon eklemek ve `setBg` çağrıldığında ghost line renklerini dinamik
olarak güncellemek.

## Glossary

- **Bug_Condition (C)**: Canvas arka planı açık renk olduğunda ghost line'ların beyaz renkte
  çizilmesi durumu — çizgiler görünmez hale gelir
- **Property (P)**: Ghost line'ların her zaman arka plan rengine karşı yüksek kontrast sağlaması
  gereken davranış (açık arka plan → siyah çizgi, koyu arka plan → beyaz çizgi)
- **Preservation**: Mevcut mouse tıklama davranışı, export dışlama, kesik çizgi stili ve
  görünürlük toggle işlevlerinin değişmeden kalması
- **ghostLines**: `app/editor.tsx` içindeki HTML template'de oluşturulan `fabric.Line` nesneleri
  dizisi; slide sınırlarını görsel olarak işaretler
- **setBg**: Canvas arka plan rengini değiştiren `window.setBg(color)` fonksiyonu; şu anda
  ghost line renklerini güncellemiyor
- **isLightColor**: Arka plan renginin açık mı koyu mu olduğunu belirleyecek yeni yardımcı
  fonksiyon; hex veya rgb renk değerini alıp boolean döndürür
- **getContrastLineColor**: `isLightColor` sonucuna göre `rgba(0,0,0,0.7)` veya
  `rgba(255,255,255,0.7)` döndürecek yeni yardımcı fonksiyon

## Bug Details

### Bug Condition

Bug, canvas arka plan rengi açık (yüksek luminance) olduğunda tetiklenir. Ghost line'lar
oluşturulurken ve `setBg` çağrıldığında renk sabit `rgba(255,255,255,0.7)` olarak kalır;
arka plan rengine göre güncellenmez.

**Formal Specification:**
```
FUNCTION isBugCondition(X)
  INPUT: X of type CanvasState { backgroundColor: string }
  OUTPUT: boolean

  RETURN isLightColor(X.backgroundColor) = true
    AND ghostLineStroke = 'rgba(255,255,255,0.7)'
END FUNCTION
```

### Examples

- Arka plan `#FFFFFF` (beyaz) → ghost line `rgba(255,255,255,0.7)` → **görünmez** (bug)
- Arka plan `#F5F5F0` (açık krem) → ghost line `rgba(255,255,255,0.7)` → **neredeyse görünmez** (bug)
- Arka plan `#FFE4E1` (açık pembe) → ghost line `rgba(255,255,255,0.7)` → **görünmez** (bug)
- Arka plan `#000000` (siyah) → ghost line `rgba(255,255,255,0.7)` → görünür (bug yok)
- Arka plan `#0D0D0D` (koyu) → ghost line `rgba(255,255,255,0.7)` → görünür (bug yok)

## Expected Behavior

### Preservation Requirements

**Değişmemesi Gereken Davranışlar:**
- Ghost line'lar `selectable: false` ve `evented: false` kalmalı (kullanıcı seçemez)
- Export işleminde ghost line'lar `excludeFromExport: true` ile dışarıda kalmalı
- Kesik çizgi stili `strokeDashArray: [20, 15]` ve kalınlık `strokeWidth: 3` korunmalı
- `hideGrid` / `showGrid` fonksiyonları görünürlüğü doğru toggle etmeye devam etmeli
- Her slide sınırına `i * slideWidth` konumunda bir divider çizgisi eklenmeye devam etmeli

**Kapsam:**
Ghost line rengi dışındaki tüm davranışlar bu düzeltmeden etkilenmemelidir. Özellikle:
- Mouse tıklamaları ve nesne seçimi
- Diğer canvas nesneleri (metin, resim, sticker)
- Undo/redo mekanizması
- Export akışı

## Hypothesized Root Cause

1. **Sabit Renk Değeri**: Ghost line'lar oluşturulurken `stroke` değeri hardcode edilmiş:
   ```js
   stroke: 'rgba(255,255,255,0.7)',
   ```
   Arka plan rengi hiç dikkate alınmıyor.

2. **setBg Güncelleme Eksikliği**: `window.setBg` fonksiyonu yalnızca canvas arka planını
   değiştiriyor; mevcut ghost line nesnelerinin `stroke` özelliğini güncellemiyor:
   ```js
   window.setBg = (color) => { c.setBackgroundColor(color, c.renderAll.bind(c)); };
   ```

3. **Luminance Hesabı Yok**: Rengin açık/koyu olduğunu belirleyecek herhangi bir yardımcı
   fonksiyon mevcut değil.

4. **İlk Yükleme Sorunu**: Proje yüklenirken `canvasData` restore edildiğinde ghost line'lar
   yeniden oluşturuluyor ancak o anki arka plan rengi yine dikkate alınmıyor.

## Correctness Properties

Property 1: Bug Condition - Kontrast Divider Çizgi Rengi

_For any_ canvas durumu X'te `isBugCondition(X)` true döndürdüğünde (arka plan açık renk ve
ghost line beyaz), düzeltilmiş `setBg` ve ghost line oluşturma kodu ghost line'ları
`rgba(0,0,0,0.7)` (siyah) renkte çizmeli ve canvas'ı yeniden render etmelidir.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - Ghost Line Özellikleri Korunur

_For any_ canvas durumu X'te `isBugCondition(X)` false döndürdüğünde (arka plan koyu renk),
düzeltilmiş kod ghost line'ların `selectable`, `evented`, `excludeFromExport`, `strokeDashArray`,
`strokeWidth` özelliklerini ve `hideGrid`/`showGrid` davranışını değiştirmeden korumalıdır.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

**Dosya**: `app/editor.tsx`

**Fonksiyon**: `html()` içindeki inline JavaScript template

**Specific Changes**:

1. **`isLightColor` Yardımcı Fonksiyonu Ekle**: Hex veya rgb renk değerini parse edip
   relative luminance hesaplar; 0.5 eşiğinin üzerindeyse `true` döndürür:
   ```js
   function isLightColor(color) {
     let r, g, b;
     if (color.startsWith('#')) {
       const hex = color.replace('#', '');
       r = parseInt(hex.substring(0, 2), 16);
       g = parseInt(hex.substring(2, 4), 16);
       b = parseInt(hex.substring(4, 6), 16);
     } else {
       const m = color.match(/\d+/g);
       [r, g, b] = m.map(Number);
     }
     const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
     return luminance > 0.5;
   }
   ```

2. **`getContrastLineColor` Yardımcı Fonksiyonu Ekle**:
   ```js
   function getContrastLineColor(bgColor) {
     return isLightColor(bgColor) ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)';
   }
   ```

3. **Ghost Line Oluşturma Kısmını Güncelle**: Sabit renk yerine dinamik renk kullan:
   ```js
   // Önce: stroke: 'rgba(255,255,255,0.7)',
   // Sonra:
   const initialBg = '${selColor}';
   const initialLineColor = getContrastLineColor(initialBg);
   // ...
   stroke: initialLineColor,
   ```

4. **`setBg` Fonksiyonunu Güncelle**: Arka plan değiştiğinde ghost line renklerini de güncelle:
   ```js
   window.setBg = (color) => {
     c.setBackgroundColor(color, () => {
       const lineColor = getContrastLineColor(color);
       ghostLines.forEach(l => l.set({ stroke: lineColor }));
       c.renderAll();
     });
   };
   ```

## Testing Strategy

### Validation Approach

İki aşamalı yaklaşım: önce düzeltilmemiş kodda bug'ı gösteren counterexample'lar üret,
ardından düzeltmenin doğru çalıştığını ve mevcut davranışın korunduğunu doğrula.

### Exploratory Bug Condition Checking

**Hedef**: Düzeltme yapılmadan önce bug'ı somut olarak göster. Kök neden analizini doğrula
veya çürüt.

**Test Planı**: Ghost line oluşturma ve `setBg` çağrısını simüle eden testler yaz. Bu testleri
DÜZELTILMEMIŞ kod üzerinde çalıştırarak başarısızlıkları gözlemle.

**Test Cases**:
1. **Açık Arka Plan Testi**: `backgroundColor = '#FFFFFF'` ile ghost line oluştur, `stroke`
   değerinin `rgba(255,255,255,0.7)` olduğunu gözlemle (düzeltilmemiş kodda başarısız olacak)
2. **setBg Güncelleme Testi**: Koyu arka plandan açık arka plana geçişte ghost line renginin
   güncellenmediğini gözlemle (düzeltilmemiş kodda başarısız olacak)
3. **Pastel Renk Testi**: `backgroundColor = '#FFE4E1'` ile ghost line'ın görünmez olduğunu
   gözlemle (düzeltilmemiş kodda başarısız olacak)

**Expected Counterexamples**:
- Ghost line `stroke` değeri açık arka planda `rgba(255,255,255,0.7)` olarak kalıyor
- `setBg` çağrısı sonrası ghost line rengi güncellenmemiş

### Fix Checking

**Hedef**: Bug condition'ın geçerli olduğu tüm girdiler için düzeltilmiş fonksiyonun
beklenen davranışı ürettiğini doğrula.

**Pseudocode:**
```
FOR ALL X WHERE isBugCondition(X) DO
  result := renderGhostLines_fixed(X)
  ASSERT result.ghostLineStroke = 'rgba(0,0,0,0.7)'
END FOR
```

### Preservation Checking

**Hedef**: Bug condition'ın geçerli olmadığı tüm girdiler için düzeltilmiş fonksiyonun
orijinal fonksiyonla aynı sonucu ürettiğini doğrula.

**Pseudocode:**
```
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT renderGhostLines_original(X) = renderGhostLines_fixed(X)
END FOR
```

**Testing Approach**: Property-based testing önerilir çünkü:
- Geniş renk uzayında (hex, rgb, pastel, koyu, nötr) otomatik test üretir
- Manuel testlerin kaçırabileceği edge case'leri yakalar
- Koyu arka plan davranışının değişmediğine dair güçlü garanti sağlar

**Test Cases**:
1. **Koyu Arka Plan Preservation**: `#000000`, `#0D0D0D`, `#1A1A1A` gibi koyu renklerde
   ghost line'ın `rgba(255,255,255,0.7)` kaldığını doğrula
2. **Ghost Line Özellikleri Preservation**: `selectable`, `evented`, `excludeFromExport`,
   `strokeDashArray`, `strokeWidth` değerlerinin değişmediğini doğrula
3. **hideGrid/showGrid Preservation**: Görünürlük toggle'ının düzeltme sonrası da çalıştığını doğrula

### Unit Tests

- `isLightColor` fonksiyonunu beyaz, siyah, pastel, koyu gri renkleriyle test et
- `getContrastLineColor` fonksiyonunun doğru rengi döndürdüğünü test et
- `setBg` çağrısı sonrası ghost line `stroke` değerinin güncellendiğini test et
- Edge case: `#808080` (tam orta gri) için eşik davranışını test et

### Property-Based Tests

- Rastgele açık hex renkleri üret → ghost line her zaman `rgba(0,0,0,0.7)` olmalı
- Rastgele koyu hex renkleri üret → ghost line her zaman `rgba(255,255,255,0.7)` olmalı
- Rastgele renk geçişleri üret → `setBg` sonrası ghost line rengi her zaman kontrast olmalı

### Integration Tests

- Açık arka planlı proje yükle → ghost line'ların siyah göründüğünü doğrula
- Arka planı açıktan koyuya değiştir → ghost line'ların beyaza döndüğünü doğrula
- Export akışında ghost line'ların hâlâ dışarıda kaldığını doğrula
