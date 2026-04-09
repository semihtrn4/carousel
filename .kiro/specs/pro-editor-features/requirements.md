# Gereksinimler Belgesi

## Giriş

Bu özellik, mevcut carousel editörüne (WebView + Fabric.js mimarisi korunarak) profesyonel düzenleme araçları ekler. Eklenen özellikler: hayalet slide çizgileri, genişletilmiş içerik kütüphanesi (cutout harfler, sosyal medya frame'leri, ek sticker'lar), layer panel, element tray ve seçili nesne araç çubuğu.

## Sözlük

- **Editor**: `app/editor.tsx` dosyasındaki React Native ekranı
- **Canvas**: WebView içinde çalışan Fabric.js canvas'ı
- **WebView**: React Native içinde HTML/JS çalıştıran bileşen
- **injectJavaScript**: React Native'den WebView'a JavaScript komutu gönderme mekanizması
- **postMessage**: WebView'dan React Native'e mesaj gönderme mekanizması
- **Hayalet Çizgi (Ghost Line)**: Slide sınırlarını gösteren, yalnızca editörde görünen kesikli dikey çizgi
- **Layer Panel**: Canvas'taki tüm nesneleri listeleyen yan panel
- **Element Tray**: Canvas nesnelerinin küçük thumbnail'lerini gösteren yatay şerit
- **Object Toolbar**: Seçili nesne için işlem araçlarını gösteren araç çubuğu
- **Cutout Letter**: Gazete/dergi tarzı kesik harf görseli (A-Z)
- **Frame**: Instagram, TikTok gibi sosyal medya platformlarına özgü dekoratif çerçeve
- **TABS**: Editor'daki sekme listesi (`photos`, `text`, `stickers`, `background`, `layers`, `elements`)
- **Fabric.js**: Canvas üzerinde nesne yönetimi sağlayan JavaScript kütüphanesi

---

## Gereksinimler

### Gereksinim 1: Hayalet Slide Çizgileri

**Kullanıcı Hikayesi:** Bir içerik üreticisi olarak, editörde slide sınırlarını görmek istiyorum; böylece tasarımımı slide'lara göre hizalayabilirim.

#### Kabul Kriterleri

1. THE Editor SHALL her slide sınırında (1. slide hariç) Canvas üzerine kesikli dikey çizgi render etmek için `.grid` CSS sınıfına sahip DOM elemanları oluşturur.
2. WHILE Editor yüklü durumdayken, THE Canvas SHALL hayalet çizgileri `pointer-events: none` olarak render eder; böylece çizgiler nesne seçimini engellemez.
3. WHEN `window.hideGrid()` fonksiyonu çağrıldığında, THE Canvas SHALL tüm `.grid` elemanlarını gizler (`display: none`).
4. WHEN `window.showGrid()` fonksiyonu çağrıldığında, THE Canvas SHALL tüm `.grid` elemanlarını tekrar görünür yapar.
5. WHEN export işlemi başlatıldığında, THE Editor SHALL `window.hideGrid()` çağrısını `window.exportCanvas()` çağrısından önce gerçekleştirir.
6. WHEN export işlemi tamamlandığında, THE Editor SHALL `window.showGrid()` çağrısını gerçekleştirerek çizgileri geri getirir.
7. THE Canvas SHALL hayalet çizgileri `rgba(255,255,255,0.4)` renginde ve `repeating-linear-gradient` ile kesikli olarak render eder.

---

### Gereksinim 2: Cutout Letter Kütüphanesi

**Kullanıcı Hikayesi:** Bir içerik üreticisi olarak, gazete/dergi tarzı kesik harf görselleri eklemek istiyorum; böylece scrapbook estetiğinde tasarımlar oluşturabilirim.

#### Kabul Kriterleri

1. THE Editor SHALL `constants/templates.ts` dosyasına A-Z arası 26 harfi kapsayan `CUTOUT_LETTERS` dizisini ekler; her eleman `{ id, letter, emoji }` alanlarını içerir.
2. THE Editor SHALL `TABS` dizisine `{ id: 'elements', icon: Type, label: 'Elements' }` sekmesini ekler.
3. WHEN `elements` sekmesi aktifken, THE Editor SHALL cutout harfleri yatay kaydırılabilir bir listede gösterir.
4. WHEN bir cutout harfe tıklandığında, THE Editor SHALL `window.addSticker(emoji, targetLeft)` çağrısını mevcut slide'ın merkez koordinatıyla gerçekleştirir.
5. THE Editor SHALL cutout harfleri emoji tabanlı styled karakterler (örn. 🅰️🅱️) olarak başlangıç implementasyonunda kullanır; CDN bağımlılığı olmadan çalışır.

---

### Gereksinim 3: Sosyal Medya Frame'leri

**Kullanıcı Hikayesi:** Bir içerik üreticisi olarak, Instagram ve TikTok frame'lerini tasarımıma eklemek istiyorum; böylece sosyal medya paylaşımlarım için hazır çerçeveler kullanabilirim.

#### Kabul Kriterleri

1. THE Editor SHALL `constants/templates.ts` dosyasına `FRAMES` dizisini ekler; dizi en az şu frame'leri içerir: Instagram Post (1:1), Instagram Story (9:16), TikTok (9:16).
2. WHEN `elements` sekmesi aktifken, THE Editor SHALL frame'leri cutout harflerden ayrı bir bölümde listeler.
3. WHEN bir frame seçildiğinde, THE Editor SHALL SVG tabanlı çerçeveyi `fabric.Image.fromURL` veya `fabric.loadSVGFromString` ile Canvas'a ekler.
4. THE Editor SHALL frame SVG'lerini kod içinde string olarak tanımlar; harici CDN bağımlılığı kullanmaz.
5. WHEN bir frame Canvas'a eklendiğinde, THE Editor SHALL frame'i mevcut slide'ın tam boyutuna (`RATIOS[ratio]`) ölçekler.

---

### Gereksinim 4: Ek Sticker Kategorileri

**Kullanıcı Hikayesi:** Bir içerik üreticisi olarak, mevcut sticker koleksiyonuna ek kategoriler eklemek istiyorum; böylece daha çeşitli tasarımlar oluşturabilirim.

#### Kabul Kriterleri

1. THE Editor SHALL `constants/templates.ts` dosyasındaki `STICKERS` dizisini en az 3 yeni kategori ile genişletir: `nature` (🌵🌴🍄 vb.), `food` (🍕🍦🧁 vb.), `mood` (😎🥹🫶 vb.).
2. THE Editor SHALL sticker panelinde kategorileri sekme veya başlık ile gruplandırır.
3. WHEN bir sticker kategorisi seçildiğinde, THE Editor SHALL yalnızca o kategoriye ait sticker'ları gösterir.

---

### Gereksinim 5: Layer Panel

**Kullanıcı Hikayesi:** Bir içerik üreticisi olarak, canvas'taki tüm nesneleri bir listede görmek istiyorum; böylece nesneleri kolayca seçebilir ve sıralayabilirim.

#### Kabul Kriterleri

1. THE Editor SHALL `TABS` dizisine `{ id: 'layers', icon: Layers, label: 'Layers' }` sekmesini ekler.
2. WHEN `layers` sekmesi aktifken, THE Editor SHALL Canvas'taki tüm nesnelerin listesini gösterir; her satır nesne tipi ikonu, nesne adı/tipi ve görünürlük toggle'ı içerir.
3. WHEN Canvas'ta bir nesne eklendiğinde veya kaldırıldığında, THE WebView SHALL `{ type: 'layersUpdate', layers: [...] }` mesajını postMessage ile React Native'e gönderir.
4. WHEN layer listesindeki bir satıra tıklandığında, THE Editor SHALL `window.selectObject(objectId)` çağrısını gerçekleştirir ve Canvas'ta ilgili nesneyi seçer.
5. WHEN layer listesinde "Yukarı Taşı" butonuna tıklandığında, THE Editor SHALL `c.bringForward(obj)` Fabric.js metodunu çağırır.
6. WHEN layer listesinde "Aşağı Taşı" butonuna tıklandığında, THE Editor SHALL `c.sendBackwards(obj)` Fabric.js metodunu çağırır.
7. WHEN layer görünürlük toggle'ı kapatıldığında, THE Editor SHALL `obj.set({ visible: false })` ve `c.renderAll()` çağrılarını gerçekleştirir.
8. WHEN layer görünürlük toggle'ı açıldığında, THE Editor SHALL `obj.set({ visible: true })` ve `c.renderAll()` çağrılarını gerçekleştirir.
9. THE Canvas SHALL her nesneye benzersiz bir `id` atar; bu id layer listesi ile Canvas nesnesi arasındaki eşleşmeyi sağlar.

---

### Gereksinim 6: Element Tray

**Kullanıcı Hikayesi:** Bir içerik üreticisi olarak, canvas'taki tüm elementlerin küçük önizlemelerini alt panelde görmek istiyorum; böylece hızlıca nesne seçebilirim.

#### Kabul Kriterleri

1. THE Editor SHALL canvas alanı ile toolbar arasına yatay kaydırılabilir bir Element Tray bileşeni ekler.
2. WHILE Canvas'ta en az bir nesne bulunduğunda, THE Element Tray SHALL her nesne için küçük thumbnail veya tip ikonu gösterir.
3. WHEN Element Tray'deki bir thumbnail'e tıklandığında, THE Editor SHALL `window.selectObject(objectId)` çağrısını gerçekleştirir.
4. WHEN Canvas'ta bir nesne seçildiğinde, THE Element Tray SHALL ilgili thumbnail'i vurgular (aktif border veya arka plan rengi ile).
5. THE Element Tray SHALL Layer Panel ile senkronize çalışır; Canvas'ta nesne eklendiğinde veya kaldırıldığında her iki bileşen de güncellenir.
6. WHEN Canvas'ta hiç nesne bulunmadığında, THE Element Tray SHALL görünmez olur veya minimum yükseklikte render edilir.

---

### Gereksinim 7: Seçili Nesne Araç Çubuğu (Object Toolbar)

**Kullanıcı Hikayesi:** Bir içerik üreticisi olarak, seçili nesne üzerinde hızlı işlemler yapmak istiyorum; böylece sekme değiştirmeden nesneyi düzenleyebilirim.

#### Kabul Kriterleri

1. WHEN Canvas'ta bir nesne seçildiğinde, THE WebView SHALL `{ type: 'objectSelected', objectId, objectType, properties: { opacity, fill, shadow } }` mesajını postMessage ile React Native'e gönderir.
2. WHEN `objectSelected` mesajı alındığında, THE Editor SHALL Object Toolbar'ı canvas alanının alt kısmında gösterir.
3. WHEN Canvas'ta nesne seçimi kaldırıldığında, THE WebView SHALL `{ type: 'objectDeselected' }` mesajını gönderir ve THE Editor SHALL Object Toolbar'ı gizler.
4. THE Object Toolbar SHALL şu araçları içerir: Delete (sil), Duplicate (çoğalt), Bring Forward (öne getir), Send Backward (arkaya gönder), Opacity (opaklık), Fill/Color (renk), Blur (bulanıklık), Stroke (kenarlık).
5. WHEN Delete butonuna tıklandığında, THE Editor SHALL `window.deleteSel()` çağrısını gerçekleştirir.
6. WHEN Duplicate butonuna tıklandığında, THE Editor SHALL `window.duplicateSel()` çağrısını gerçekleştirir; Canvas'ta seçili nesnenin kopyası 20px offset ile eklenir.
7. WHEN Opacity slider'ı değiştirildiğinde, THE Editor SHALL `window.setOpacity(value)` çağrısını gerçekleştirir; Canvas'ta `obj.set({ opacity: value })` uygulanır.
8. WHEN Blur değeri değiştirildiğinde, THE Editor SHALL `window.setBlur(value)` çağrısını gerçekleştirir; Canvas'ta `obj.set({ shadow: new fabric.Shadow({ blur: value, color: 'rgba(0,0,0,0.5)' }) })` uygulanır.
9. WHEN Stroke değeri değiştirildiğinde, THE Editor SHALL `window.setStroke(color, width)` çağrısını gerçekleştirir; Canvas'ta `obj.set({ stroke: color, strokeWidth: width })` uygulanır.
10. WHEN Fill/Color seçildiğinde, THE Editor SHALL renk seçici gösterir ve seçilen rengi `window.setFill(color)` ile Canvas'a uygular.
11. WHEN "Slide'a Taşı" seçeneği kullanıldığında, THE Editor SHALL nesnenin `left` koordinatını hedef slide'ın merkez koordinatına (`(targetSlide - 1) * slideWidth + slideWidth / 2`) güncelleyen `window.moveToSlide(slideIndex)` çağrısını gerçekleştirir.

---

### Gereksinim 8: WebView Mesaj Protokolü Genişletmesi

**Kullanıcı Hikayesi:** Bir geliştirici olarak, WebView ile React Native arasındaki mesaj protokolünün yeni özellikler için genişletilmesini istiyorum; böylece tüm bileşenler tutarlı şekilde iletişim kurar.

#### Kabul Kriterleri

1. THE Canvas SHALL `object:selected` Fabric.js olayında `objectSelected` mesajını postMessage ile gönderir; mesaj `objectId`, `objectType` ve `properties` alanlarını içerir.
2. THE Canvas SHALL `object:added` ve `object:removed` Fabric.js olaylarında `layersUpdate` mesajını postMessage ile gönderir; mesaj güncel nesne listesini içerir.
3. THE Canvas SHALL `selection:cleared` Fabric.js olayında `objectDeselected` mesajını postMessage ile gönderir.
4. THE Editor SHALL `onMsg` fonksiyonunu `objectSelected`, `objectDeselected` ve `layersUpdate` mesaj tiplerini işleyecek şekilde genişletir.
5. IF WebView'dan gelen mesaj JSON parse edilemezse, THEN THE Editor SHALL hatayı `console.error` ile loglar ve kullanıcı arayüzünü etkilemez.
