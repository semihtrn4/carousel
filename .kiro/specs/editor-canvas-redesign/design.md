# Editor Canvas Redesign – Bugfix Tasarımı

## Genel Bakış

Bu belge, `app/editor.tsx` içindeki Fabric.js tabanlı WebView canvas editörünün beş temel hatasını gidermek için tasarım kararlarını ve doğrulama yaklaşımını tanımlar.

Temel sorun: WebView içindeki Fabric.js canvas'ı toplam genişliği (örn. 3 slide × 1080px = 3240px) ekran genişliğini çok aştığı için görünmez ya da kullanılamaz hale geliyor. Buna ek olarak içerik konumlandırma, canvas zoom ve export mantığında da hatalar mevcut.

Düzeltme stratejisi: CSS `transform: scale()` ile canvas'ı ekrana sığdır, pinch-to-zoom'u canvas seviyesine taşı, içerik koordinatlarını görünür alana göre hesapla ve export döngüsünü her slide için ayrı PNG üretecek şekilde güncelle.

---

## Sözlük

- **Bug_Condition (C)**: Hatayı tetikleyen koşul — canvas görünürlük, slide düzeni, zoom, konumlandırma veya export sorunlarından birini tetikleyen kullanıcı eylemi
- **Property (P)**: Hata koşulu gerçekleştiğinde beklenen doğru davranış (2.1–2.5 gereksinimleri)
- **Preservation**: Düzeltmeden etkilenmemesi gereken mevcut davranışlar (undo/redo, nesne sürükleme, arka plan rengi vb.)
- **scaleToFit**: `window.innerWidth / totalCanvasWidth` formülüyle hesaplanan başlangıç ölçek değeri; canvas'ın tüm slide'larıyla birlikte ekrana sığmasını sağlar
- **canvasScale**: Anlık canvas zoom seviyesi; `scaleToFit` ile `scaleToFit * 5` arasında kalır
- **isBugCondition**: Bir kullanıcı eyleminin hata koşulunu tetikleyip tetiklemediğini döndüren sözde-kod fonksiyonu
- **addTxt / addSticker / addImg**: WebView içinde Fabric.js nesnesi ekleyen JavaScript fonksiyonları
- **curSlide**: React Native tarafında tutulan aktif slide indeksi (1 tabanlı)
- **slideWidth**: Tek bir slide'ın piksel genişliği (`RATIOS[ratio].width`)

---

## Hata Detayları

### Hata Koşulu

Hata; kullanıcı canvas'ı görüntülediğinde, editörü açtığında, pinch yaptığında, içerik eklediğinde veya galeriye kaydettiğinde ortaya çıkar. `html()` fonksiyonu canvas'ı ölçeklemiyor, `addTxt`/`addSticker`/`addImg` sabit `top: h/2` kullanıyor, pinch-to-zoom yalnızca nesne ölçeklendiriyor ve export döngüsü `cropX` hesabını ham canvas boyutuna göre yapıyor.

**Formal Tanım:**

```
FUNCTION isBugCondition(X)
  INPUT: X of type EditorAction
  OUTPUT: boolean

  RETURN (
    X.action = 'view_canvas'       // S1: canvas ölçeklenmemiş, görünmüyor
    OR X.action = 'open_editor'    // S2: slide şeridi yok, sınır çizgileri zayıf
    OR X.action = 'pinch_canvas'   // S3: canvas zoom yok
    OR X.action = 'add_element'    // S4: içerik görünür alanın dışına düşüyor
    OR X.action = 'export_gallery' // S5: tek PNG, slide'lar ayrılmıyor
  )
END FUNCTION
```

### Örnekler

- **S1**: 3 slide × 1080px = 3240px canvas, 390px ekranda — canvas görünmez. Beklenen: `scale(0.12)` ile tüm canvas ekrana sığar.
- **S2**: Editör açıldığında slide sınır çizgileri çok ince (2px, düşük opaklık). Beklenen: 3px, kesikli, `rgba(255,255,255,0.6)` opaklık.
- **S3**: İki parmakla pinch yapıldığında seçili nesne ölçekleniyor, canvas zoom olmuyor. Beklenen: seçili nesne yoksa canvas zoom.
- **S4**: `addTxt` çağrıldığında `top: h/2 = 675` (portrait için) — canvas ölçeklendiğinde bu koordinat ekranın çok altında kalır. Beklenen: `top = (window.innerHeight / 2) / canvasScale`.
- **S5**: 3 slide için "Save to Gallery" → 1 PNG kaydediliyor. Beklenen: 3 ayrı PNG.

---

## Beklenen Davranış

### Preservation Gereksinimleri

**Değişmemesi Gereken Davranışlar:**
- Undo/redo geçmişi düzeltmeden sonra da doğru çalışmalı (Gereksinim 3.1)
- Nesne sürükleme ve serbest konumlandırma korunmalı (Gereksinim 3.2)
- Seçili nesne üzerinde pinch → nesne ölçeklendirme korunmalı (Gereksinim 3.3)
- Arka plan rengi değiştirme tüm canvas'a uygulanmaya devam etmeli (Gereksinim 3.4)
- Preview butonu canvas'ı PNG olarak export edip preview ekranına yönlendirmeli (Gereksinim 3.5)
- Seçili nesneyi silme çalışmaya devam etmeli (Gereksinim 3.6)
- Template yüklendiğinde slide sayısı ve oran doğru uygulanmalı (Gereksinim 3.7)

**Kapsam:**
`isBugCondition` false döndüren tüm eylemler (undo, redo, nesne sürükleme, renk seçimi, silme, template yükleme) bu düzeltmeden tamamen etkilenmemelidir.

---

## Hipotez: Kök Neden

1. **CSS Ölçekleme Eksikliği (S1, S2)**: `html()` fonksiyonu canvas container'ına hiçbir `transform: scale()` uygulamıyor. WebView ekran genişliğinde render ediyor, 3240px canvas görünmez oluyor.

2. **Sabit `top` Koordinatı (S4)**: `addTxt`, `addSticker`, `addImg` fonksiyonları `top: ${h / 2}` kullanıyor. Canvas ölçeklendiğinde bu değer görünür alanın çok dışında kalıyor; içerik ekrana gelmiyor.

3. **Pinch-to-Zoom Yalnızca Nesne Ölçeklendiriyor (S3)**: Mevcut `touchmove` handler'ı `c.getActiveObject()` varsa nesneyi ölçeklendiriyor, canvas zoom state'i hiç tutmuyor.

4. **Export Crop Hesabı Yanlış (S5)**: `export.tsx` zaten her slide için ayrı crop yapıyor (`i * dims.width`) — ancak `imageData` WebView'dan gelen ham canvas PNG'si değil, `toDataURL` çıktısı. Gerçek piksel boyutları ile `dims.width` uyuşmayabilir; `imageWidth / slides` formülü kullanılmalı.

5. **Slide Sınır Çizgileri Zayıf (S2)**: `.grid` div'leri 2px genişlik ve düşük opaklıkla tanımlı; ölçeklenmiş canvas'ta neredeyse görünmez oluyor.

---

## Doğruluk Özellikleri

Property 1: Hata Koşulu – Canvas Görünürlük ve İçerik Konumlandırma

_For any_ `EditorAction` where `isBugCondition(X)` returns true (view_canvas, open_editor, pinch_canvas, add_element, export_gallery), the fixed editor SHALL:
- Canvas'ı `scaleToFit = SCREEN_W / totalCanvasWidth` oranında ölçekleyerek tüm slide'ları ekranda göstermeli,
- Eklenen içeriği `top = (window.innerHeight / 2) / canvasScale` koordinatına yerleştirmeli,
- Pinch hareketi canvas zoom olarak uygulanmalı (seçili nesne yoksa),
- Export'ta `slideCount` kadar ayrı PNG üretmeli.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation – Mevcut Editör Davranışları

_For any_ `EditorAction` where `isBugCondition(X)` returns false (undo, redo, drag, delete, setBg, template load, preview), the fixed editor SHALL produce exactly the same behavior as the original editor, preserving all existing functionality for non-buggy interactions.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

---

## Düzeltme Implementasyonu

### Değişiklikler

**Dosya**: `app/editor.tsx` — `html()` fonksiyonu

**1. Canvas Ölçekleme (S1, S2)**

Canvas oluşturulduktan sonra container'a CSS transform uygula:

```javascript
const SCREEN_W = window.innerWidth;
const SCREEN_H = window.innerHeight;
const scaleToFit = SCREEN_W / ${w};
const container = document.getElementById('container');
container.style.transform = `scale(${scaleToFit})`;
container.style.transformOrigin = 'top left';
container.style.position = 'absolute';
container.style.top = '0';
container.style.left = '0';
let canvasScale = scaleToFit;
```

**2. Slide Sınır Çizgileri (S2)**

`.grid` CSS'ini güncelle:

```css
.grid {
  width: 3px;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 12px,
    transparent 12px, transparent 24px
  );
}
```

**3. Canvas Zoom (S3)**

Pinch handler'ı iki moda ayır — seçili nesne varsa nesne ölçeklendir, yoksa canvas zoom:

```javascript
let pinchStartDist = 0;
// touchmove içinde:
const obj = c.getActiveObject();
if (obj && lastPinchDist > 0) {
  // mevcut nesne ölçeklendirme mantığı korunur
} else if (lastPinchDist > 0) {
  const ratio = dist / lastPinchDist;
  canvasScale = Math.max(scaleToFit, Math.min(scaleToFit * 5, canvasScale * ratio));
  container.style.transform = `scale(${canvasScale})`;
}
lastPinchDist = dist;
```

**4. İçerik Konumlandırma (S4)**

`addTxt`, `addSticker`, `addImg` fonksiyonlarında `top` değerini görünür alana göre hesapla:

```javascript
// Her add fonksiyonunda:
const visibleCenterY = (window.innerHeight / 2) / canvasScale;
// top: visibleCenterY olarak kullan (h/2 yerine)
```

**Dosya**: `app/export.tsx`

**5. Export Döngüsü (S5)**

Mevcut döngü yapısı doğru (`i * dims.width`) ancak `imageData`'nın gerçek piksel boyutunu kullan:

```typescript
// ImageManipulator ile boyut al, sonra her slide için:
const cropW = imageWidth / slides;
const cropX = i * cropW;
```

---

## Test Stratejisi

### Doğrulama Yaklaşımı

İki aşamalı: önce düzeltilmemiş kodda hataları gösteren counterexample'lar üret, sonra düzeltmenin doğru çalıştığını ve mevcut davranışların korunduğunu doğrula.

### Keşif Testi (Bug Condition Checking)

**Amaç**: Düzeltme uygulanmadan önce hataları gözlemle, kök neden analizini doğrula veya çürüt.

**Test Planı**: WebView HTML'ini izole ortamda render et, canvas boyutlarını ve transform değerlerini kontrol et. `addTxt`/`addSticker` çağrılarından dönen koordinatları doğrula.

**Test Senaryoları**:
1. **Canvas Ölçek Testi**: `scaleToFit` hesaplanmadan canvas render edildiğinde container genişliği `SCREEN_W`'yi aşıyor mu? (düzeltilmemiş kodda başarısız olur)
2. **İçerik Konumlandırma Testi**: `addTxt` çağrıldığında `top` değeri görünür alanın dışında mı? (düzeltilmemiş kodda başarısız olur)
3. **Pinch Zoom Testi**: Seçili nesne yokken pinch yapıldığında `canvasScale` değişiyor mu? (düzeltilmemiş kodda başarısız olur)
4. **Export Sayısı Testi**: 3 slide için export çağrıldığında kaç asset oluşturuluyor? (düzeltilmemiş kodda 1 döner, 3 beklenir)

**Beklenen Counterexample'lar**:
- `container.style.transform` boş string veya undefined
- `top` koordinatı `h/2` (örn. 675) — görünür alan dışında
- `savedCount === 1` (3 bekleniyor)

### Fix Checking

**Amaç**: Hata koşulunun geçerli olduğu tüm girdiler için düzeltilmiş fonksiyonun beklenen davranışı ürettiğini doğrula.

```
FOR ALL X WHERE isBugCondition(X) DO
  result := editor_fixed(X)
  ASSERT expectedBehavior(result)  // Property 1
END FOR
```

### Preservation Checking

**Amaç**: Hata koşulunun geçerli olmadığı tüm girdiler için düzeltilmiş fonksiyonun orijinal fonksiyonla aynı sonucu ürettiğini doğrula.

```
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT editor_original(X) = editor_fixed(X)  // Property 2
END FOR
```

**Test Yaklaşımı**: Property-based testing tercih edilir çünkü:
- Giriş uzayı genelinde otomatik olarak çok sayıda test senaryosu üretir
- Manuel unit testlerin kaçırabileceği edge case'leri yakalar
- Tüm non-buggy girdiler için davranışın değişmediğine dair güçlü garanti sağlar

**Test Senaryoları**:
1. **Undo/Redo Preservation**: Düzeltme sonrası undo/redo geçmişi aynı şekilde çalışıyor mu?
2. **Nesne Sürükleme Preservation**: Fabric.js nesne drag davranışı değişmedi mi?
3. **Arka Plan Rengi Preservation**: `setBg` çağrısı tüm canvas'a uygulanıyor mu?
4. **Template Yükleme Preservation**: Template slide sayısı ve oranı doğru yükleniyor mu?

### Unit Testler

- `scaleToFit` hesaplamasının farklı ekran genişlikleri ve slide sayıları için doğru sonuç verdiğini test et
- `visibleCenterY` koordinatının her zoom seviyesinde görünür alan içinde kaldığını doğrula
- Export döngüsünün `slideCount` kadar crop işlemi yaptığını doğrula
- Pinch handler'ın seçili nesne varlığına göre doğru moda geçtiğini test et

### Property-Based Testler

- Rastgele `(slides, ratio, screenWidth)` kombinasyonları için `scaleToFit * totalCanvasWidth === screenWidth` özelliğini doğrula
- Rastgele `canvasScale` değerleri için `canvasScale >= scaleToFit` (minimum zoom korunur) özelliğini doğrula
- Rastgele slide sayıları için export'un tam olarak `slides` kadar asset ürettiğini doğrula

### Entegrasyon Testleri

- Editör açılışından export'a tam akış: 3 slide oluştur, içerik ekle, galeriye kaydet → 3 PNG
- Zoom in/out sonrası içerik ekleme: zoom değiştiğinde yeni eklenen içerik hâlâ görünür alanda mı?
- Template seçimi → editör açılışı → canvas ölçekleme: template oranı doğru uygulanıyor mu?
