# Uygulama Planı: Pro Editor Özellikleri

## Genel Bakış

Mevcut carousel editörüne (`app/editor.tsx`) profesyonel düzenleme araçları eklenir. Mimari değişmez: React Native + WebView + Fabric.js. Görevler bağımlılık sırasına göre düzenlenmiştir; her adım bir öncekinin üzerine inşa edilir.

## Görevler

- [x] 1. `constants/templates.ts` genişletmesi
  - [x] 1.1 `CUTOUT_LETTERS` dizisini ekle (A-Z, 26 eleman, `{ id, letter, emoji }` yapısı)
    - Her harf için regional indicator emoji kullan (🅰️🅱️🇨🇩🇪...)
    - _Gereksinimler: 2.1_
  - [ ]* 1.2 `CUTOUT_LETTERS` bütünlüğü için özellik testi yaz
    - **Özellik 3: CUTOUT_LETTERS Bütünlüğü**
    - **Doğrular: Gereksinim 2.1**
  - [x] 1.3 `FRAMES` dizisini ekle (Instagram Post, Instagram Story, TikTok; inline SVG string'ler)
    - `Frame` tipini tanımla: `{ id, name, platform, ratio, svg }`
    - _Gereksinimler: 3.1, 3.4_
  - [x] 1.4 `STICKER_CATEGORIES` dizisini ekle (general, nature, food, mood kategorileri)
    - `StickerCategory` tipini tanımla: `{ id, label, stickers[] }`
    - Mevcut `STICKERS` içeriğini `general` kategorisine taşı
    - nature: 🌵🌴🍄🌾🌻🌹🍁🌊🌋; food: 🍕🍦🧁🍩🍣🍔🥑🍓🧃; mood: 😎🥹🫶🥳😍🤩🫠😴🤯
    - _Gereksinimler: 4.1_

- [x] 2. WebView HTML güncellemesi
  - [x] 2.1 `window.hideGrid()` ve `window.showGrid()` fonksiyonlarını `html()` içine ekle
    - `hideGrid`: `.grid` elemanlarını `display: none` yap
    - `showGrid`: `.grid` elemanlarını `display: block` yap
    - _Gereksinimler: 1.3, 1.4_
  - [ ]* 2.2 Grid hide/show round-trip için özellik testi yaz
    - **Özellik 2: Grid Hide/Show Round-Trip**
    - **Doğrular: Gereksinim 1.3, 1.4**
  - [ ]* 2.3 Grid sayısı doğruluğu için özellik testi yaz
    - **Özellik 1: Grid Sayısı Doğruluğu**
    - **Doğrular: Gereksinim 1.1**
  - [x] 2.4 Her nesneye benzersiz `id` atamasını `addImg`, `addTxt`, `addSticker` fonksiyonlarına ekle
    - `Date.now().toString()` kullan
    - _Gereksinimler: 5.9_
  - [ ]* 2.5 Nesne ID benzersizliği için özellik testi yaz
    - **Özellik 8: Nesne ID Benzersizliği**
    - **Doğrular: Gereksinim 5.9**
  - [x] 2.6 `sendLayersUpdate()` yardımcı fonksiyonunu ekle ve `object:added`, `object:removed`, `object:modified` olaylarına bağla
    - Her nesne için `{ id, type, visible, name }` içeren dizi gönder
    - _Gereksinimler: 5.3, 8.2_
  - [ ]* 2.7 `layersUpdate` mesajı tutarlılığı için özellik testi yaz
    - **Özellik 7: layersUpdate Mesajı Tutarlılığı**
    - **Doğrular: Gereksinim 5.3, 8.2**
  - [x] 2.8 `selection:created` ve `selection:cleared` Fabric.js olay dinleyicilerini ekle
    - `objectSelected`: `objectId`, `objectType`, `properties` (opacity, fill, shadow) gönder
    - `objectDeselected`: boş mesaj gönder
    - _Gereksinimler: 7.1, 8.1, 8.3_
  - [ ]* 2.9 `objectSelected` mesaj yapısı için özellik testi yaz
    - **Özellik 12: objectSelected Mesaj Yapısı**
    - **Doğrular: Gereksinim 7.1, 8.1**
  - [x] 2.10 `window.selectObject(id)`, `window.bringForward(id)`, `window.sendBackward(id)`, `window.toggleVisibility(id)` fonksiyonlarını ekle
    - Nesne bulunamazsa sessiz çıkış yap
    - _Gereksinimler: 5.4, 5.5, 5.6, 5.7, 5.8_
  - [x] 2.11 `window.duplicateSel()`, `window.setOpacity(v)`, `window.setBlur(v)`, `window.setStroke(color, width)`, `window.setFill(color)`, `window.moveToSlide(slideIndex, slideWidth)` fonksiyonlarını ekle
    - `moveToSlide`: `left = (slideIndex - 1) * slideWidth + slideWidth / 2`
    - _Gereksinimler: 7.6, 7.7, 7.8, 7.9, 7.10, 7.11_
  - [ ]* 2.12 `moveToSlide` koordinat hesabı için özellik testi yaz
    - **Özellik 15: moveToSlide Koordinat Hesabı**
    - **Doğrular: Gereksinim 7.11**

- [x] 3. `editor.tsx` state güncellemesi
  - [x] 3.1 `LayerItem` ve `SelectedObject` tiplerini tanımla, `layers`, `selectedObject`, `selectedObjectId` state'lerini ekle
    - `LayerItem`: `{ id, type, visible, name }`
    - `SelectedObject`: `{ id, type, opacity, fill, shadow } | null`
    - _Gereksinimler: 5.1, 6.1, 7.2_
  - [x] 3.2 `TABS` dizisine `layers` ve `elements` sekmelerini ekle
    - `{ id: 'layers', icon: Layers, label: 'Layers' }` ve `{ id: 'elements', icon: Type, label: 'Elements' }`
    - Gerekli ikonları `lucide-react-native`'den import et
    - _Gereksinimler: 2.2, 5.1_

- [x] 4. `onMsg` genişletmesi
  - [x] 4.1 `onMsg` fonksiyonuna `layersUpdate`, `objectSelected`, `objectDeselected` mesaj tiplerini işle
    - `layersUpdate`: `setLayers(m.layers)`
    - `objectSelected`: `setSelectedObjectId` ve `setSelectedObject` güncelle
    - `objectDeselected`: her iki state'i sıfırla
    - _Gereksinimler: 8.4, 8.5_
  - [ ]* 4.2 Geçersiz JSON dayanıklılığı için özellik testi yaz
    - **Özellik 16: Geçersiz JSON Dayanıklılığı**
    - **Doğrular: Gereksinim 8.5**
  - [ ]* 4.3 Select/deselect round-trip için özellik testi yaz
    - **Özellik 13: Select/Deselect Round-Trip**
    - **Doğrular: Gereksinim 7.3, 8.3**

- [x] 5. `goPreview` ve `onExport` güncellemesi
  - [x] 5.1 `goPreview` fonksiyonunu `hideGrid` + `exportCanvas` sırasıyla çalışacak şekilde güncelle
    - `window.hideGrid(); window.exportCanvas();`
    - _Gereksinimler: 1.5_
  - [x] 5.2 `onExport` callback'ine `window.showGrid()` çağrısı ekle
    - Export tamamlandıktan sonra grid'i geri getir
    - _Gereksinimler: 1.6_

- [x] 6. Kontrol Noktası 1 — Temel altyapı
  - Tüm testlerin geçtiğini doğrula, sorular varsa kullanıcıya sor.

- [x] 7. Layer Panel UI
  - [x] 7.1 `LayerRow` bileşenini `editor.tsx` içinde tanımla
    - Nesne tipi ikonu, nesne adı, görünürlük toggle'ı, yukarı/aşağı taşı butonları içerir
    - _Gereksinimler: 5.2_
  - [x] 7.2 `toolbar()` switch'ine `layers` case'ini ekle
    - `layers` state'ini `LayerRow` listesi olarak render et
    - `onSelect`, `onBringForward`, `onSendBackward`, `onToggleVisibility` callback'lerini bağla
    - _Gereksinimler: 5.2, 5.4, 5.5, 5.6, 5.7, 5.8_
  - [ ]* 7.3 Layer/Tray seçim yönlendirmesi için özellik testi yaz
    - **Özellik 9: Layer/Tray Seçim Yönlendirmesi**
    - **Doğrular: Gereksinim 5.4, 6.3**

- [x] 8. Element Tray UI
  - [x] 8.1 `getTypeIcon(type)` yardımcı fonksiyonunu ekle (text → 'T', image → '🖼', diğer → '◻')
    - _Gereksinimler: 6.2_
  - [x] 8.2 Canvas ile toolbar arasına yatay kaydırılabilir Element Tray ekle
    - `layers.length > 0` koşuluna göre göster/gizle
    - Seçili thumbnail'i `selectedObjectId` ile vurgula
    - Thumbnail'e tıklandığında `window.selectObject(id)` çağır
    - _Gereksinimler: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [ ]* 8.3 Element Tray thumbnail sayısı için özellik testi yaz
    - **Özellik 10: Element Tray Thumbnail Sayısı**
    - **Doğrular: Gereksinim 6.2**
  - [ ]* 8.4 Aktif thumbnail vurgulama için özellik testi yaz
    - **Özellik 11: Aktif Thumbnail Vurgulama**
    - **Doğrular: Gereksinim 6.4**

- [x] 9. Object Toolbar UI
  - [x] 9.1 `selectedObject !== null` iken canvas ile toolbar arasında gösterilen Object Toolbar bileşenini ekle
    - Delete, Duplicate, Bring Forward, Send Backward butonları
    - Opacity slider (0-1)
    - Fill/Color seçici
    - Blur slider (0-100)
    - Stroke renk + genişlik girişi
    - "Slide'a Taşı" seçeneği
    - _Gereksinimler: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11_
  - [ ]* 9.2 Toolbar araç çağrıları için özellik testi yaz
    - **Özellik 14: Toolbar Araç Çağrıları**
    - **Doğrular: Gereksinim 7.7, 7.8, 7.9, 7.10**

- [ ] 10. Elements sekmesi UI (cutout harfler + frame'ler)
  - [x] 10.1 `toolbar()` switch'ine `elements` case'ini ekle
    - Cutout harfleri yatay kaydırılabilir listede göster
    - Frame'leri ayrı bölümde listele
    - Harfe/frame'e tıklandığında `window.addSticker(emoji, targetLeft)` veya SVG ekleme çağrısı yap
    - _Gereksinimler: 2.3, 2.4, 3.2, 3.3, 3.5_
  - [ ]* 10.2 Cutout harf tıklama → doğru emoji için özellik testi yaz
    - **Özellik 4: Cutout Harf Tıklama → Doğru Emoji**
    - **Doğrular: Gereksinim 2.4**
  - [ ]* 10.3 Frame ölçekleme doğruluğu için özellik testi yaz
    - **Özellik 5: Frame Ölçekleme Doğruluğu**
    - **Doğrular: Gereksinim 3.5**

- [ ] 11. Sticker kategorileri UI güncellemesi
  - [x] 11.1 `stickers` sekmesini `STICKER_CATEGORIES` kullanacak şekilde güncelle
    - Kategori seçici (sekme veya başlık) ekle
    - Seçili kategorinin sticker'larını göster
    - _Gereksinimler: 4.2, 4.3_
  - [ ]* 11.2 Sticker kategori filtresi için özellik testi yaz
    - **Özellik 6: Sticker Kategori Filtresi**
    - **Doğrular: Gereksinim 4.3**

- [x] 12. Son Kontrol Noktası — Tüm testler geçmeli
  - Tüm testlerin geçtiğini doğrula, sorular varsa kullanıcıya sor.

## Notlar

- `*` ile işaretli görevler isteğe bağlıdır; MVP için atlanabilir
- Her görev ilgili gereksinim numarasına referans verir
- Özellik testleri için `fast-check` kütüphanesi kullanılır
- Kontrol noktaları artımlı doğrulama sağlar
