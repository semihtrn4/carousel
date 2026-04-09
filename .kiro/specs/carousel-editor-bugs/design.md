# Carousel Editor Bugs – Bugfix Tasarım Belgesi

## Genel Bakış

Carousel Studio editöründe tespit edilen altı kritik hata, kullanıcının temel düzenleme akışını (fotoğraf ekleme, metin/sticker yerleştirme, slide geçişi, preview) engellemektedir. Bu belge her hatanın hata koşulunu (C), beklenen davranışını (P) ve korunması gereken mevcut davranışları tanımlar; ardından kök neden analizi, düzeltme planı ve test stratejisini ortaya koyar.

Tüm hatalar `app/editor.tsx` ve `app/preview.tsx` dosyalarında, Fabric.js canvas'ının React Native WebView içinde çalıştığı mimaride bulunmaktadır.

---

## Sözlük

- **Hata Koşulu (C)**: Hatayı tetikleyen girdi veya durum kümesi
- **Özellik (P)**: C koşulu sağlandığında beklenen doğru davranış
- **Koruma**: Düzeltmenin etkilememesi gereken mevcut davranışlar
- **curSlide**: `editor.tsx`'te aktif slide'ı tutan React state (1-tabanlı)
- **slideWidth**: Tek bir slide'ın piksel genişliği — `RATIOS[ratio].width`
- **WebView ↔ RN köprüsü**: `injectJavaScript` (RN→WebView) ve `postMessage` (WebView→RN) iletişim kanalı
- **addTxt / addSticker**: WebView içindeki Fabric.js canvas'ına nesne ekleyen global JS fonksiyonları
- **isBugCondition(input)**: Verilen girdinin hatalı davranışı tetikleyip tetiklemediğini döndüren soyut fonksiyon

---

## Hata Detayları

### H1 – Selection Box Kafa Karıştırıcılığı

#### Hata Koşulu

Kullanıcı canvas üzerindeki herhangi bir nesneye dokunduğunda Fabric.js varsayılan selection box'ı (8 köşe tutamacı + kenarlık) gösterilmektedir. Mobil ekranda bu tutamaçlar küçük ve kafa karıştırıcıdır.

```
FUNCTION isBugCondition_H1(event)
  INPUT: event — kullanıcının canvas nesnesine dokunma olayı
  OUTPUT: boolean

  RETURN nesneSeçildi(event)
         AND fabric.defaultControls aktif
         AND hasControls = true (varsayılan)
END FUNCTION
```

**Örnekler:**
- Kullanıcı bir fotoğrafa dokunur → 8 köşe tutamacı belirir, kullanıcı hangisinin ne işe yaradığını bilemez
- Kullanıcı metne dokunur → döndürme tutamacı da görünür, yanlışlıkla döndürme yapılabilir

---

### H2 – Slide Geçişi Çalışmıyor

#### Hata Koşulu

```
FUNCTION isBugCondition_H2(event)
  INPUT: event — WebView içinde yatay swipe touch olayı
  OUTPUT: boolean

  RETURN event.type IN ['touchstart', 'touchend']
         AND abs(event.deltaX) > SWIPE_THRESHOLD
         AND WebView'da swipe dinleyici YOK
         AND curSlide React state'i güncellenmemiş
END FUNCTION
```

**Örnekler:**
- Kullanıcı 2. slide'a geçmek için sola swipe yapar → canvas kayar ama `curSlide` hâlâ 1 gösterir
- Kullanıcı 3. slide'dayken metin ekler → metin 2. slide'a (canvas merkezi) eklenir
- Dot indicator her zaman 1. noktayı aktif gösterir

---

### H3 – Preview'da Thumbnail Şeridi Eksik

#### Hata Koşulu

```
FUNCTION isBugCondition_H3(state)
  INPUT: state — preview.tsx render durumu
  OUTPUT: boolean

  RETURN slides > 1
         AND thumbnailScrollView YOK
         AND yalnızca tek büyük ScrollView mevcut
END FUNCTION
```

**Örnekler:**
- 5 slide'lı carousel preview'da açılır → altta thumbnail şeridi görünmez
- Kullanıcı hangi slide'da olduğunu yalnızca dot indicator'dan anlayabilir

---

### H4 – Galeriden Fotoğraf Eklenemiyor

#### Hata Koşulu

```
FUNCTION isBugCondition_H4(uri)
  INPUT: uri — expo-image-picker'dan dönen dosya URI'ı
  OUTPUT: boolean

  RETURN uri.startsWith('file://')
         AND platform IN ['android', 'ios']
         AND WebView crossOrigin kısıtlaması aktif
         AND base64'e dönüşüm YAPILMAMIŞ
END FUNCTION
```

**Örnekler:**
- Android'de `file:///data/user/0/.../image.jpg` URI'ı WebView'a inject edilir → canvas'ta fotoğraf görünmez
- iOS'ta bazı durumlarda `ph://` URI'ı da aynı sorunu yaratır

---

### H5 – Metin Aktif Slide'a Değil Sabit Konuma Ekleniyor

#### Hata Koşulu

```
FUNCTION isBugCondition_H5(curSlide, addedLeft)
  INPUT: curSlide — aktif slide numarası (1-tabanlı)
         addedLeft — addTxt'e verilen left koordinatı
  OUTPUT: boolean

  slideWidth := RATIOS[ratio].width
  beklenenLeft := (curSlide - 1) * slideWidth + slideWidth / 2

  RETURN addedLeft != beklenenLeft
         AND addedLeft = canvasToplamGenislik / 2  // sabit merkez
END FUNCTION
```

**Örnekler:**
- 3 slide, portrait (1080px): canvas genişliği 3240px, `w/2 = 1620` → her zaman 2. slide'a eklenir
- Kullanıcı 1. slide'dayken metin ekler → metin 2. slide'da görünür
- Kullanıcı 3. slide'dayken metin ekler → yine 2. slide'da görünür

---

### H6 – Sticker Aktif Slide'a Değil Sabit Konuma Ekleniyor

#### Hata Koşulu

```
FUNCTION isBugCondition_H6(curSlide, addedLeft)
  INPUT: curSlide — aktif slide numarası (1-tabanlı)
         addedLeft — addSticker'a verilen left koordinatı
  OUTPUT: boolean

  slideWidth := RATIOS[ratio].width
  beklenenLeft := (curSlide - 1) * slideWidth + slideWidth / 2

  RETURN addedLeft != beklenenLeft
         AND addedLeft = canvasToplamGenislik / 2
END FUNCTION
```

H5 ile aynı kök neden; `addSticker` da `w/2` sabit koordinatını kullanmaktadır.

---

## Beklenen Davranış

### Koruma Gereksinimleri

**Değişmemesi Gereken Davranışlar:**
- Undo/redo geçmişi doğru çalışmaya devam etmeli (3.2)
- Background rengi değiştirme tüm canvas'ı etkilemeye devam etmeli (3.3)
- Seçili nesne silme (X butonu) çalışmaya devam etmeli (3.4)
- Preview butonu canvas'ı export edip preview ekranına yönlendirmeye devam etmeli (3.5)
- "Leave Editor?" uyarı diyaloğu çalışmaya devam etmeli (3.6)
- Font ailesi ve boyut seçimi metne uygulanmaya devam etmeli (3.7)
- Preview ekranındaki büyük swipeable slide görünümü korunmalı (3.1)

**Kapsam:**
Hata koşullarının dışındaki tüm girdiler (undo/redo, bg rengi, silme, export, font seçimi) bu düzeltmeden etkilenmemelidir.

---

## Kök Neden Hipotezi

### H1 – Selection Box
Fabric.js nesneleri oluşturulurken `hasControls` ve `hasBorders` varsayılan olarak `true` bırakılmıştır. Mobil için özelleştirilmiş bir kontrol seti tanımlanmamıştır.

### H2 – Slide Geçişi
WebView HTML'inde touch event dinleyicisi bulunmamaktadır. `curSlide` state'i yalnızca React Native tarafında tutulmakta, WebView'dan `postMessage` ile güncellenmemektedir.

### H3 – Thumbnail Şeridi
`preview.tsx`'te yalnızca tek bir `ScrollView` (büyük slide görünümü) mevcuttur. Alt thumbnail şeridi hiç eklenmemiştir.

### H4 – Fotoğraf Ekleme
`pickImg` fonksiyonu `res.assets[0].uri` değerini doğrudan WebView'a inject etmektedir. `file://` URI'ları WebView'ın güvenlik politikası nedeniyle cross-origin olarak değerlendirilir ve yüklenemez. Çözüm: `expo-file-system` ile dosyayı base64'e okuyup `data:image/jpeg;base64,...` formatında inject etmek.

### H5 & H6 – Metin/Sticker Konumlandırma
`addTxt` ve `addSticker` fonksiyonları `left: ${w / 2}` sabit değerini kullanmaktadır. Bu değer `curSlide`'dan bağımsızdır. WebView HTML'i bir kez render edildiğinde `curSlide` değişikliklerini takip etmemektedir; `curSlide` WebView'a inject edilmemektedir.

---

## Doğruluk Özellikleri

Property 1: Hata Koşulu – Metin/Sticker Aktif Slide'a Eklenmeli

_Her_ `curSlide ∈ [1..slides]` değeri ve `ratio ∈ {square, portrait, story, landscape}` için, `addTxt` veya `addSticker` çağrıldığında eklenen nesnenin `left` koordinatı `(curSlide - 1) * slideWidth + slideWidth / 2` değerine eşit OLMALIDIR.

**Validates: Requirements 5.1, 6.1**

Property 2: Koruma – Sabit Koordinat Dışındaki Davranışlar Değişmemeli

_Her_ `curSlide` değeri için, `addTxt` ve `addSticker` çağrılarında `top`, `fontFamily`, `fontSize`, `fill`, `originX`, `originY` parametreleri orijinal kodla aynı kalmalıdır; yalnızca `left` koordinatı değişmelidir.

**Validates: Requirements 3.2, 3.7**

Property 3: Hata Koşulu – Swipe Sonrası curSlide Güncellenmeli

_Her_ geçerli swipe olayı için (deltaX > eşik, sınır içinde), WebView'dan gelen `postMessage` ile `curSlide` state'i `öncekiSlide ± 1` değerine güncellenmelidir.

**Validates: Requirements 2.1, 2.2**

Property 4: Koruma – Swipe Dışı Etkileşimler Değişmemeli

_Her_ swipe olmayan etkileşim (undo, redo, bg değiştirme, nesne silme, export) için, slide geçiş mekanizması eklendikten sonra bu işlevler orijinal kodla aynı sonucu üretmelidir.

**Validates: Requirements 3.2, 3.3, 3.4, 3.5**

---

## Düzeltme Planı

### H1 – Selection Box

**Dosya:** `app/editor.tsx` → `html()` fonksiyonu içindeki `addTxt`, `addSticker`, `addImg` çağrıları

**Değişiklik:** Fabric.js nesneleri oluşturulurken kontrol setini sadeleştir:

```javascript
// Tüm nesnelere uygulanacak ortak kontrol ayarları
const MOBILE_CONTROLS = {
  cornerColor: '#fff',
  cornerStrokeColor: '#333',
  borderColor: '#06FFB4',
  cornerSize: 20,
  transparentCorners: false,
  hasRotatingPoint: false,   // döndürme tutamacını gizle
};
// img.set({ ...MOBILE_CONTROLS, ... })
```

---

### H2 – Slide Geçişi

**Dosya:** `app/editor.tsx` → `html()` fonksiyonu

**Değişiklik 1:** WebView HTML'ine touch event dinleyicisi ekle:

```javascript
let touchStartX = 0;
document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
document.addEventListener('touchend', (e) => {
  const delta = e.changedTouches[0].clientX - touchStartX;
  const THRESHOLD = 50;
  if (Math.abs(delta) > THRESHOLD) {
    const dir = delta < 0 ? 1 : -1;  // sola swipe = ileri
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'slideChange', dir }));
  }
});
```

**Değişiklik 2:** `onMsg` handler'ında `slideChange` mesajını işle:

```typescript
else if (m.type === 'slideChange') {
  setCurSlide(prev => Math.max(1, Math.min(slides, prev + m.dir)));
}
```

---

### H3 – Preview Thumbnail Şeridi

**Dosya:** `app/preview.tsx`

**Değişiklik:** Ana `ScrollView`'ın altına thumbnail şeridi ekle:

```tsx
<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbStrip}>
  {Array.from({ length: slides }).map((_, i) => (
    <TouchableOpacity key={i} onPress={() => { /* büyük view'ı i'ye scroll et */ setCurrentSlide(i); }}>
      <View style={[styles.thumb, currentSlide === i && styles.thumbActive]}>
        <Image source={{ uri: imageData }}
          style={{ width: thumbW, height: thumbH, marginLeft: -(i * thumbW) }}
          resizeMode="cover" />
      </View>
    </TouchableOpacity>
  ))}
</ScrollView>
```

---

### H4 – Fotoğraf Ekleme

**Dosya:** `app/editor.tsx` → `pickImg` fonksiyonu

**Değişiklik:** `expo-file-system` ile URI'ı base64'e çevir:

```typescript
import * as FileSystem from 'expo-file-system';

const pickImg = async () => {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  if (!res.canceled && res.assets[0]) {
    const base64 = await FileSystem.readAsStringAsync(res.assets[0].uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const dataUri = `data:image/jpeg;base64,${base64}`;
    webRef.current?.injectJavaScript(`window.addImg('${dataUri}'); true;`);
  }
};
```

---

### H5 & H6 – Metin/Sticker Konumlandırma

**Dosya:** `app/editor.tsx`

**Değişiklik 1:** `addText` ve `addSticker` fonksiyonlarında `curSlide`'ı koordinata dahil et:

```typescript
const addText = () => {
  if (!textVal.trim()) return;
  const slideW = RATIOS[ratio].width;
  const targetLeft = (curSlide - 1) * slideW + slideW / 2;
  webRef.current?.injectJavaScript(
    `window.addTxt('${textVal.replace(/'/g, "\\'")}', { fontFamily: '${selFont.family}', fontSize: ${fontSize}, color: '#000000', left: ${targetLeft} }); true;`
  );
  setTextVal(''); setShowText(false);
};

const addSticker = (emoji: string) => {
  const slideW = RATIOS[ratio].width;
  const targetLeft = (curSlide - 1) * slideW + slideW / 2;
  webRef.current?.injectJavaScript(`window.addSticker('${emoji}', ${targetLeft}); true;`);
};
```

**Değişiklik 2:** WebView `addTxt` ve `addSticker` fonksiyonlarını `left` parametresini kabul edecek şekilde güncelle:

```javascript
window.addTxt = (txt, opts) => {
  const t = new fabric.Text(txt, {
    left: opts.left || ${w / 2},
    // ...diğer özellikler
  });
  // ...
};
window.addSticker = (emoji, left) => {
  const t = new fabric.Text(emoji, {
    left: left || ${w / 2},
    // ...
  });
  // ...
};
```

---

## Test Stratejisi

### Doğrulama Yaklaşımı

İki aşamalı strateji: önce düzeltilmemiş kodda hatayı gösteren karşı örnekler üret, ardından düzeltmenin doğru çalıştığını ve mevcut davranışların korunduğunu doğrula.

---

### Keşif Testi (Hata Koşulu Doğrulama)

**Amaç:** Düzeltme uygulanmadan önce hataları gözlemle ve kök neden analizini doğrula.

**Test Planı:** Her hata için düzeltilmemiş kodda başarısız olacak testler yaz.

**Test Senaryoları:**

1. **H5/H6 – Koordinat Testi**: `curSlide=3`, `ratio='portrait'` (slideWidth=1080) için `addTxt` çağrıldığında `left` değerinin `2160 + 540 = 2700` olması beklenir; mevcut kodda `3240/2 = 1620` döner → BAŞARISIZ
2. **H4 – URI Testi**: `file://` URI'ı WebView'a inject edildiğinde `fabric.Image.fromURL` callback'inin çağrılıp çağrılmadığını kontrol et → BAŞARISIZ (Android)
3. **H2 – Swipe Testi**: WebView'da `touchstart`/`touchend` simüle edildiğinde `postMessage` gönderilip gönderilmediğini kontrol et → BAŞARISIZ (dinleyici yok)

**Beklenen Karşı Örnekler:**
- `addTxt` left koordinatı: `1620` (beklenen: `2700` için curSlide=3)
- `postMessage` swipe sonrası: gönderilmez
- `fabric.Image.fromURL` file:// ile: callback çağrılmaz

---

### Düzeltme Kontrolü

**Amaç:** Hata koşulunun sağlandığı tüm girdiler için düzeltilmiş fonksiyonun beklenen davranışı ürettiğini doğrula.

**Sözde Kod:**
```
FOR ALL curSlide IN [1..slides], ratio IN RATIOS DO
  slideWidth := RATIOS[ratio].width
  beklenenLeft := (curSlide - 1) * slideWidth + slideWidth / 2
  result := addTxt_fixed(curSlide, ratio)
  ASSERT result.left = beklenenLeft
END FOR
```

---

### Koruma Kontrolü

**Amaç:** Hata koşulunun dışındaki tüm girdiler için düzeltilmiş fonksiyonun orijinal fonksiyonla aynı sonucu ürettiğini doğrula.

**Sözde Kod:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalFunction(input) = fixedFunction(input)
END FOR
```

**Test Yaklaşımı:** Koruma kontrolü için property-based test önerilir çünkü:
- Farklı `ratio`, `slides`, `curSlide` kombinasyonlarını otomatik üretir
- Manuel testlerin kaçırabileceği sınır durumlarını yakalar
- Değişmeyen parametrelerin (`top`, `fontFamily`, `fontSize`, `fill`) gerçekten değişmediğini güçlü biçimde garanti eder

**Test Senaryoları:**
1. **Undo/Redo Koruma**: Slide geçişi eklendikten sonra undo/redo geçmişinin bozulmadığını doğrula
2. **Background Rengi Koruma**: `setBg` çağrısının tüm canvas'ı etkilemeye devam ettiğini doğrula
3. **Font Parametresi Koruma**: `addTxt` düzeltmesinden sonra `fontFamily`, `fontSize`, `fill` değerlerinin değişmediğini doğrula
4. **Silme Koruma**: `deleteSel` fonksiyonunun düzeltmeden etkilenmediğini doğrula

---

### Birim Testler

- `isBugCondition_H5/H6`: Farklı `curSlide` ve `ratio` değerleri için koordinat hesabını doğrula
- `pickImg` base64 dönüşümü: `FileSystem.readAsStringAsync` çağrısının doğru encoding ile yapıldığını doğrula
- `onMsg` handler: `slideChange` mesajının `curSlide`'ı doğru güncellediğini doğrula
- Sınır durumları: `curSlide=1` (ilk slide), `curSlide=slides` (son slide), swipe sınır kontrolü

### Property-Based Testler

- **Koordinat özelliği**: `∀ curSlide ∈ [1..10], ∀ ratio` → `left = (curSlide-1)*slideWidth + slideWidth/2`
- **Koruma özelliği**: `∀ curSlide` → `top`, `fontFamily`, `fontSize`, `fill` değerleri sabit kalır
- **Swipe sınır özelliği**: `curSlide=1`'de sola swipe → `curSlide` 0'a düşmez; `curSlide=slides`'da sağa swipe → `slides+1`'e çıkmaz

### Entegrasyon Testleri

- Tam editör akışı: slide geçişi → metin ekleme → preview → export
- Context geçişi: farklı ratio ve slide sayılarında koordinat hesabının doğruluğu
- Android/iOS fotoğraf ekleme: base64 inject sonrası canvas'ta görsel doğrulama
