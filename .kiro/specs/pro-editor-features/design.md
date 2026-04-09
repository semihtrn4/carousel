# Tasarım Belgesi: Pro Editor Özellikleri

## Genel Bakış

Bu tasarım, mevcut carousel editörüne (`app/editor.tsx`) profesyonel düzenleme araçları ekler. Mimari değişmez: React Native + WebView + Fabric.js. Yeni özellikler bu katmanlı yapı üzerine inşa edilir.

Eklenen özellikler:
- Hayalet slide çizgileri (export'ta otomatik gizleme)
- Genişletilmiş içerik kütüphanesi (cutout harfler, sosyal medya frame'leri, ek sticker kategorileri)
- Layer panel (nesne listesi, sıralama, görünürlük)
- Element tray (yatay thumbnail şeridi)
- Object toolbar (seçili nesne araçları)
- Genişletilmiş WebView mesaj protokolü

---

## Mimari

Mevcut mimari korunur. Yeni özellikler üç katmana dağılır:

```
┌─────────────────────────────────────────────┐
│           React Native (editor.tsx)          │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │  Layer   │ │ Element  │ │   Object    │  │
│  │  Panel   │ │  Tray    │ │  Toolbar    │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
│         ↑ postMessage / injectJS ↓           │
│  ┌─────────────────────────────────────────┐ │
│  │              WebView                    │ │
│  │  ┌───────────────────────────────────┐  │ │
│  │  │         Fabric.js Canvas          │  │ │
│  │  │  + window.* fonksiyonları         │  │ │
│  │  │  + event listener'lar             │  │ │
│  │  └───────────────────────────────────┘  │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Veri Akışı

**Canvas → React Native (postMessage):**
- `layersUpdate`: Nesne eklendiğinde/kaldırıldığında/değiştirildiğinde
- `objectSelected`: Fabric.js `selection:created` olayında
- `objectDeselected`: Fabric.js `selection:cleared` olayında

**React Native → Canvas (injectJavaScript):**
- `window.hideGrid()` / `window.showGrid()`
- `window.selectObject(id)`, `window.bringForward(id)`, `window.sendBackward(id)`, `window.toggleVisibility(id)`
- `window.duplicateSel()`, `window.setOpacity(v)`, `window.setBlur(v)`, `window.setStroke(color, width)`, `window.setFill(color)`, `window.moveToSlide(slideIndex, slideWidth)`

---

## Bileşenler ve Arayüzler

### 1. Hayalet Grid (Ghost Grid)

Mevcut `.grid` CSS sınıfı ve DOM elemanları zaten `html()` fonksiyonunda oluşturuluyor. Eklenmesi gereken:

```javascript
// WebView içine eklenecek window fonksiyonları
window.hideGrid = () => {
  document.querySelectorAll('.grid').forEach(el => el.style.display = 'none');
};
window.showGrid = () => {
  document.querySelectorAll('.grid').forEach(el => el.style.display = 'block');
};
```

`goPreview()` fonksiyonu güncellenir:
```typescript
const goPreview = () => {
  webRef.current?.injectJavaScript(`window.hideGrid(); window.exportCanvas(); true;`);
};
```

Export callback'inde (`onExport`) grid geri getirilir:
```typescript
const onExport = (data: string) => {
  webRef.current?.injectJavaScript(`window.showGrid(); true;`);
  router.push({ ... });
};
```

### 2. Genişletilmiş İçerik Kütüphanesi (`constants/templates.ts`)

#### CUTOUT_LETTERS

```typescript
export type CutoutLetter = { id: string; letter: string; emoji: string };

export const CUTOUT_LETTERS: CutoutLetter[] = [
  { id: 'letter-A', letter: 'A', emoji: '🅰️' },
  { id: 'letter-B', letter: 'B', emoji: '🅱️' },
  // ... C-Z için regional indicator emojiler: 🇨🇩🇪...
];
```

#### FRAMES

```typescript
export type Frame = { id: string; name: string; platform: string; ratio: string; svg: string };

export const FRAMES: Frame[] = [
  {
    id: 'frame-ig-post',
    name: 'Instagram Post',
    platform: 'instagram',
    ratio: 'square',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080">...</svg>`
  },
  {
    id: 'frame-ig-story',
    name: 'Instagram Story',
    platform: 'instagram',
    ratio: 'story',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920">...</svg>`
  },
  {
    id: 'frame-tiktok',
    name: 'TikTok',
    platform: 'tiktok',
    ratio: 'story',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920">...</svg>`
  },
];
```

#### STICKER_CATEGORIES

```typescript
export type StickerCategory = {
  id: string;
  label: string;
  stickers: Array<{ id: string; emoji: string }>;
};

export const STICKER_CATEGORIES: StickerCategory[] = [
  { id: 'general', label: 'Genel', stickers: [ /* mevcut STICKERS */ ] },
  { id: 'nature', label: 'Doğa', stickers: [
    { id: 'nat-01', emoji: '🌵' }, { id: 'nat-02', emoji: '🌴' }, { id: 'nat-03', emoji: '🍄' }, ...
  ]},
  { id: 'food', label: 'Yiyecek', stickers: [
    { id: 'food-01', emoji: '🍕' }, { id: 'food-02', emoji: '🍦' }, { id: 'food-03', emoji: '🧁' }, ...
  ]},
  { id: 'mood', label: 'Duygu', stickers: [
    { id: 'mood-01', emoji: '😎' }, { id: 'mood-02', emoji: '🥹' }, { id: 'mood-03', emoji: '🫶' }, ...
  ]},
];
```

### 3. Layer Panel

`editor.tsx`'e eklenen state:

```typescript
const [layers, setLayers] = useState<LayerItem[]>([]);

type LayerItem = {
  id: string;
  type: string;
  visible: boolean;
  name: string;
};
```

`TABS` dizisine eklenir:
```typescript
{ id: 'layers', icon: Layers, label: 'Layers' }
```

`toolbar()` switch'ine eklenir:
```tsx
case 'layers': return (
  <ScrollView style={eStyles.panel}>
    {layers.map(layer => (
      <LayerRow
        key={layer.id}
        layer={layer}
        onSelect={() => webRef.current?.injectJavaScript(`window.selectObject('${layer.id}'); true;`)}
        onBringForward={() => webRef.current?.injectJavaScript(`window.bringForward('${layer.id}'); true;`)}
        onSendBackward={() => webRef.current?.injectJavaScript(`window.sendBackward('${layer.id}'); true;`)}
        onToggleVisibility={() => webRef.current?.injectJavaScript(`window.toggleVisibility('${layer.id}'); true;`)}
      />
    ))}
  </ScrollView>
);
```

### 4. Element Tray

Canvas ile toolbar arasına yerleştirilir:

```typescript
const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
```

```tsx
{layers.length > 0 && (
  <ScrollView horizontal style={eStyles.elementTray} showsHorizontalScrollIndicator={false}>
    {layers.map(layer => (
      <TouchableOpacity
        key={layer.id}
        style={[eStyles.trayItem, selectedObjectId === layer.id && eStyles.trayItemActive]}
        onPress={() => webRef.current?.injectJavaScript(`window.selectObject('${layer.id}'); true;`)}
      >
        <Text style={eStyles.trayIcon}>{getTypeIcon(layer.type)}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
)}
```

### 5. Object Toolbar

```typescript
type SelectedObject = {
  id: string;
  type: string;
  opacity: number;
  fill: string | null;
  shadow: number;
} | null;

const [selectedObject, setSelectedObject] = useState<SelectedObject>(null);
```

Toolbar yalnızca `selectedObject !== null` iken render edilir, canvas ile toolbar arasına yerleştirilir.

### 6. Genişletilmiş `onMsg` Fonksiyonu

```typescript
const onMsg = (e: WebViewMessageEvent) => {
  try {
    const m = JSON.parse(e.nativeEvent.data);
    if (m.type === 'ready') setLoading(false);
    else if (m.type === 'export') onExport(m.data);
    else if (m.type === 'slideChange') {
      setCurSlide(prev => Math.max(1, Math.min(slides, prev + m.dir)));
    }
    else if (m.type === 'layersUpdate') {
      setLayers(m.layers);
    }
    else if (m.type === 'objectSelected') {
      setSelectedObjectId(m.objectId);
      setSelectedObject({ id: m.objectId, type: m.objectType, ...m.properties });
    }
    else if (m.type === 'objectDeselected') {
      setSelectedObjectId(null);
      setSelectedObject(null);
    }
  } catch (err) {
    console.error('Msg error:', err);
  }
};
```

### 7. WebView Fabric.js Olay Dinleyicileri

Her nesneye `id` atanır:

```javascript
// addImg, addTxt, addSticker fonksiyonlarına eklenir:
img.set({ id: Date.now().toString(), ...MOBILE_CONTROLS });
```

Layer güncelleme mesajı:
```javascript
function sendLayersUpdate() {
  const layers = c.getObjects().map(obj => ({
    id: obj.id,
    type: obj.type,
    visible: obj.visible !== false,
    name: obj.type === 'text' ? obj.text?.substring(0, 10) : obj.type
  }));
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'layersUpdate', layers }));
}
c.on('object:added', sendLayersUpdate);
c.on('object:removed', sendLayersUpdate);
c.on('object:modified', sendLayersUpdate);
```

Nesne seçim mesajları:
```javascript
c.on('selection:created', (e) => {
  const obj = e.selected[0];
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'objectSelected',
    objectId: obj.id,
    objectType: obj.type,
    properties: { opacity: obj.opacity || 1, fill: obj.fill, shadow: obj.shadow?.blur || 0 }
  }));
});
c.on('selection:cleared', () => {
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'objectDeselected' }));
});
```

---

## Veri Modelleri

### LayerItem

```typescript
type LayerItem = {
  id: string;        // Fabric.js nesne id'si (Date.now().toString())
  type: string;      // 'text' | 'image' | 'rect' | vb.
  visible: boolean;  // obj.visible !== false
  name: string;      // text için ilk 10 karakter, diğerleri için type
};
```

### SelectedObject

```typescript
type SelectedObject = {
  id: string;
  type: string;
  opacity: number;   // 0-1 arası
  fill: string | null;
  shadow: number;    // blur değeri, 0 = yok
} | null;
```

### CutoutLetter

```typescript
type CutoutLetter = {
  id: string;    // 'letter-A' formatı
  letter: string; // 'A'
  emoji: string;  // '🅰️'
};
```

### Frame

```typescript
type Frame = {
  id: string;
  name: string;
  platform: 'instagram' | 'tiktok' | string;
  ratio: 'square' | 'portrait' | 'story' | 'landscape';
  svg: string;   // inline SVG string
};
```

### StickerCategory

```typescript
type StickerCategory = {
  id: string;
  label: string;
  stickers: Array<{ id: string; emoji: string }>;
};
```

### WebView Mesaj Tipleri

```typescript
type WebViewMessage =
  | { type: 'ready' }
  | { type: 'export'; data: string }
  | { type: 'slideChange'; dir: 1 | -1 }
  | { type: 'layersUpdate'; layers: LayerItem[] }
  | { type: 'objectSelected'; objectId: string; objectType: string; properties: { opacity: number; fill: string | null; shadow: number } }
  | { type: 'objectDeselected' };
```

---

## Doğruluk Özellikleri

*Bir özellik (property), sistemin tüm geçerli çalışmalarında doğru olması gereken bir karakteristik veya davranıştır — temelde sistemin ne yapması gerektiğine dair biçimsel bir ifadedir. Özellikler, insan tarafından okunabilir spesifikasyonlar ile makine tarafından doğrulanabilir doğruluk garantileri arasındaki köprüyü oluşturur.*

### Özellik 1: Grid Sayısı Doğruluğu

*Herhangi bir* N slide sayısı için, Canvas'ta oluşturulan `.grid` DOM elemanlarının sayısı tam olarak N-1 olmalıdır.

**Doğrular: Gereksinim 1.1**

---

### Özellik 2: Grid Hide/Show Round-Trip

*Herhangi bir* grid konfigürasyonu için, `hideGrid()` çağrısı tüm `.grid` elemanlarını gizlemeli; ardından `showGrid()` çağrısı tüm elemanları tekrar görünür yapmalıdır.

**Doğrular: Gereksinim 1.3, 1.4**

---

### Özellik 3: CUTOUT_LETTERS Bütünlüğü

*Herhangi bir* CUTOUT_LETTERS dizisi için, dizi tam olarak 26 eleman içermeli ve her elemanın `id`, `letter`, `emoji` alanları boş olmamalıdır.

**Doğrular: Gereksinim 2.1**

---

### Özellik 4: Cutout Harf Tıklama → Doğru Emoji

*Herhangi bir* cutout harf için, o harfe tıklandığında `window.addSticker` çağrısı o harfin `emoji` değeriyle yapılmalıdır.

**Doğrular: Gereksinim 2.4**

---

### Özellik 5: Frame Ölçekleme Doğruluğu

*Herhangi bir* ratio değeri için, frame Canvas'a eklendiğinde ölçekleme komutu o ratio'nun tam boyutlarını (`RATIOS[ratio].width` × `RATIOS[ratio].height`) içermelidir.

**Doğrular: Gereksinim 3.5**

---

### Özellik 6: Sticker Kategori Filtresi

*Herhangi bir* sticker kategorisi seçildiğinde, gösterilen sticker'ların tamamı yalnızca o kategoriye ait olmalıdır; başka kategoriden sticker görünmemelidir.

**Doğrular: Gereksinim 4.3**

---

### Özellik 7: layersUpdate Mesajı Tutarlılığı

*Herhangi bir* canvas değişikliği (nesne ekleme veya kaldırma) sonrasında, `layersUpdate` mesajının `layers` dizisi Canvas'taki gerçek nesne listesini yansıtmalıdır.

**Doğrular: Gereksinim 5.3, 8.2**

---

### Özellik 8: Nesne ID Benzersizliği

*Herhangi bir* sayıda nesne Canvas'a eklendiğinde, tüm nesnelerin `id` değerleri birbirinden farklı olmalıdır.

**Doğrular: Gereksinim 5.9**

---

### Özellik 9: Layer/Tray Seçim Yönlendirmesi

*Herhangi bir* `objectId` için, Layer Panel'deki satıra veya Element Tray'deki thumbnail'e tıklandığında `window.selectObject` tam olarak o `objectId` ile çağrılmalıdır.

**Doğrular: Gereksinim 5.4, 6.3**

---

### Özellik 10: Element Tray Thumbnail Sayısı

*Herhangi bir* layers listesi için, Element Tray'deki thumbnail sayısı `layers.length`'e eşit olmalıdır.

**Doğrular: Gereksinim 6.2**

---

### Özellik 11: Aktif Thumbnail Vurgulama

*Herhangi bir* `selectedObjectId` için, Element Tray'de yalnızca o id'ye sahip thumbnail aktif stil almalıdır; diğer thumbnail'ler normal stilde kalmalıdır.

**Doğrular: Gereksinim 6.4**

---

### Özellik 12: objectSelected Mesaj Yapısı

*Herhangi bir* Fabric.js nesne seçimi için, `objectSelected` mesajı `objectId`, `objectType` ve `properties` (`opacity`, `fill`, `shadow`) alanlarını içermelidir.

**Doğrular: Gereksinim 7.1, 8.1**

---

### Özellik 13: Select/Deselect Round-Trip

*Herhangi bir* nesne seçimi sonrasında `objectDeselected` mesajı alındığında, `selectedObject` state'i `null` olmalı ve Object Toolbar gizlenmelidir.

**Doğrular: Gereksinim 7.3, 8.3**

---

### Özellik 14: Toolbar Araç Çağrıları

*Herhangi bir* opacity değeri (0-1), blur değeri (0-100), stroke rengi ve genişliği için, ilgili toolbar aracı etkileşimi doğru parametrelerle WebView fonksiyonunu çağırmalıdır.

**Doğrular: Gereksinim 7.7, 7.8, 7.9, 7.10**

---

### Özellik 15: moveToSlide Koordinat Hesabı

*Herhangi bir* `slideIndex` ve `slideWidth` değeri için, `moveToSlide` çağrısının ürettiği `left` koordinatı `(slideIndex - 1) * slideWidth + slideWidth / 2` formülüne eşit olmalıdır.

**Doğrular: Gereksinim 7.11**

---

### Özellik 16: Geçersiz JSON Dayanıklılığı

*Herhangi bir* geçersiz JSON string için, `onMsg` çağrısı sonrasında `layers`, `selectedObject`, `selectedObjectId` state'leri değişmemelidir.

**Doğrular: Gereksinim 8.5**

---

## Hata Yönetimi

### WebView Mesaj Hataları

`onMsg` fonksiyonu mevcut `try/catch` bloğunu korur. JSON parse hatası `console.error` ile loglanır, UI state değişmez.

### Fabric.js Nesne Bulunamadı

`window.selectObject`, `window.bringForward`, `window.sendBackward`, `window.toggleVisibility` fonksiyonları nesne bulunamazsa sessizce çıkar:

```javascript
window.selectObject = (id) => {
  const obj = c.getObjects().find(o => o.id === id);
  if (!obj) return; // sessiz çıkış
  c.setActiveObject(obj);
  c.renderAll();
};
```

### Frame SVG Yükleme Hatası

`fabric.loadSVGFromString` başarısız olursa hata loglanır, Canvas durumu değişmez.

### Export Sırasında Grid Gizleme Hatası

`hideGrid()` başarısız olsa bile `exportCanvas()` çağrılır; export işlemi bloklanmaz.

---

## Test Stratejisi

### Birim Testleri

Belirli örnekler ve edge case'ler için:

- `CUTOUT_LETTERS` dizisinin 26 eleman içerdiği ve her elemanın gerekli alanları taşıdığı
- `FRAMES` dizisinin en az 3 eleman içerdiği
- `STICKER_CATEGORIES`'in `nature`, `food`, `mood` kategorilerini içerdiği
- `TABS` dizisinde `layers` ve `elements` sekmelerinin bulunduğu
- `onMsg` fonksiyonunun `layersUpdate`, `objectSelected`, `objectDeselected` mesajlarını doğru işlediği
- `layers.length === 0` iken Element Tray'in görünmez olduğu
- Object Toolbar'ın tüm araçları içerdiği

### Özellik Tabanlı Testler (Property-Based Tests)

**Kütüphane:** `fast-check` (TypeScript/JavaScript için)

Her özellik testi minimum 100 iterasyon çalıştırır. Test etiketi formatı:
`Feature: pro-editor-features, Property {N}: {özellik_metni}`

**Özellik 1 — Grid Sayısı:**
```typescript
// Feature: pro-editor-features, Property 1: Grid count equals slides - 1
fc.assert(fc.property(fc.integer({ min: 1, max: 10 }), (slideCount) => {
  const gridCount = generateGridElements(slideCount).length;
  return gridCount === slideCount - 1;
}));
```

**Özellik 2 — Grid Hide/Show Round-Trip:**
```typescript
// Feature: pro-editor-features, Property 2: hideGrid/showGrid round-trip
fc.assert(fc.property(fc.integer({ min: 1, max: 10 }), (slideCount) => {
  const grids = generateGridElements(slideCount);
  hideGrid(grids);
  expect(grids.every(el => el.style.display === 'none')).toBe(true);
  showGrid(grids);
  return grids.every(el => el.style.display !== 'none');
}));
```

**Özellik 6 — Sticker Kategori Filtresi:**
```typescript
// Feature: pro-editor-features, Property 6: Sticker category filter
fc.assert(fc.property(fc.constantFrom(...STICKER_CATEGORIES.map(c => c.id)), (categoryId) => {
  const filtered = filterStickersByCategory(categoryId);
  return filtered.every(s => s.categoryId === categoryId);
}));
```

**Özellik 8 — Nesne ID Benzersizliği:**
```typescript
// Feature: pro-editor-features, Property 8: Object IDs are unique
fc.assert(fc.property(fc.array(fc.string(), { minLength: 1, maxLength: 50 }), (objectTypes) => {
  const ids = objectTypes.map(() => generateObjectId());
  return new Set(ids).size === ids.length;
}));
```

**Özellik 15 — moveToSlide Koordinat Hesabı:**
```typescript
// Feature: pro-editor-features, Property 15: moveToSlide coordinate formula
fc.assert(fc.property(
  fc.integer({ min: 1, max: 20 }),
  fc.integer({ min: 100, max: 2000 }),
  (slideIndex, slideWidth) => {
    const left = calculateMoveToSlideLeft(slideIndex, slideWidth);
    return left === (slideIndex - 1) * slideWidth + slideWidth / 2;
  }
));
```

**Özellik 16 — Geçersiz JSON Dayanıklılığı:**
```typescript
// Feature: pro-editor-features, Property 16: Invalid JSON resilience
fc.assert(fc.property(fc.string(), (invalidJson) => {
  fc.pre(!isValidJson(invalidJson));
  const stateBefore = getEditorState();
  handleMessage(invalidJson);
  const stateAfter = getEditorState();
  return deepEqual(stateBefore, stateAfter);
}));
```

### Entegrasyon Testleri

- WebView ↔ React Native mesaj akışının uçtan uca çalışması
- Export akışında grid gizleme/gösterme sıralaması
- Layer Panel ve Element Tray senkronizasyonu
