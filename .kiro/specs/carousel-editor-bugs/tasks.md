# Uygulama Planı

- [x] 1. Hata koşulu keşif testi yaz (Düzeltme öncesi)
  - **Property 1: Bug Condition** - Metin/Sticker Sabit Koordinat Hatası
  - **KRİTİK**: Bu test düzeltilmemiş kodda BAŞARISIZ olmalı — başarısızlık hatanın varlığını kanıtlar
  - **DÜZELTME YAPMA**: Test veya kod başarısız olduğunda düzeltmeye çalışma
  - **AMAÇ**: Hatanın var olduğunu gösteren karşı örnekleri ortaya çıkar
  - **Kapsam**: `curSlide=3`, `ratio='portrait'` (slideWidth=1080) için `addTxt` çağrıldığında `left` değerinin `2700` olması beklenir; mevcut kodda `3240/2 = 1620` döner
  - H5/H6 koordinat testi: `∀ curSlide ∈ [1..slides]` için `addTxt`/`addSticker` çağrısında `left = (curSlide-1)*slideWidth + slideWidth/2` olmalı
  - H2 swipe testi: WebView'da `touchstart`/`touchend` simüle edildiğinde `postMessage` gönderilip gönderilmediğini kontrol et → BAŞARISIZ (dinleyici yok)
  - H4 URI testi: `file://` URI'ı WebView'a inject edildiğinde `fabric.Image.fromURL` callback'inin çağrılıp çağrılmadığını kontrol et → BAŞARISIZ (Android)
  - Testi yaz, çalıştır ve başarısızlığı belgele
  - **BEKLENEN SONUÇ**: Test BAŞARISIZ (bu doğru — hatanın varlığını kanıtlar)
  - Karşı örnekleri belgele: `addTxt left=1620` (beklenen: 2700 curSlide=3 için), `postMessage` gönderilmez, `file://` callback çağrılmaz
  - Görev tamamlandı sayılır: test yazıldığında, çalıştırıldığında ve başarısızlık belgelendiğinde
  - _Requirements: 5.1, 6.1, 2.1, 4.1_

- [x] 2. Koruma property testleri yaz (Düzeltme öncesi)
  - **Property 2: Preservation** - Değişmemesi Gereken Davranışlar
  - **ÖNEMLİ**: Gözlem-önce metodolojisini uygula
  - Düzeltilmemiş kodda hata koşulu dışındaki girdileri gözlemle:
    - `addTxt` çağrısında `top`, `fontFamily`, `fontSize`, `fill`, `originX`, `originY` değerlerini kaydet
    - `setBg` çağrısının tüm canvas'ı etkilediğini gözlemle
    - `deleteSel` fonksiyonunun seçili nesneyi kaldırdığını gözlemle
    - `undo`/`redo` geçmişinin doğru çalıştığını gözlemle
  - Property-based test yaz: `∀ curSlide` için `addTxt` düzeltmesinden sonra `top`, `fontFamily`, `fontSize`, `fill` değerleri değişmemeli
  - Testleri düzeltilmemiş kodda çalıştır
  - **BEKLENEN SONUÇ**: Testler BAŞARILI (temel davranışı koruma referansı)
  - Görev tamamlandı sayılır: testler yazıldığında, çalıştırıldığında ve düzeltilmemiş kodda geçtiğinde
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. H4 – Galeriden fotoğraf ekleme düzeltmesi

  - [x] 3.1 expo-file-system ile base64 dönüşümü uygula
    - `expo-file-system` paketini import et: `import * as FileSystem from 'expo-file-system'`
    - `pickImg` fonksiyonunda `res.assets[0].uri` değerini doğrudan inject etmek yerine base64'e çevir
    - `FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })` kullan
    - `data:image/jpeg;base64,${base64}` formatında dataUri oluştur
    - `webRef.current?.injectJavaScript(\`window.addImg('${dataUri}'); true;\`)` ile inject et
    - _Bug_Condition: `isBugCondition_H4(uri)` — `uri.startsWith('file://')` AND base64 dönüşümü yapılmamış_
    - _Expected_Behavior: base64 dataUri WebView'a inject edilir, cross-origin hatası olmaz, fotoğraf canvas'a eklenir_
    - _Preservation: Fotoğraf ekleme akışı (ImagePicker → canvas) korunmalı; yalnızca URI→base64 adımı ekleniyor_
    - _Requirements: 4.1_

  - [x] 3.2 Hata koşulu keşif testinin artık geçtiğini doğrula
    - **Property 1: Expected Behavior** - Fotoğraf Base64 Inject
    - **ÖNEMLİ**: Görev 1'deki AYNI testi yeniden çalıştır — yeni test yazma
    - `file://` URI testi artık `fabric.Image.fromURL` callback'ini çağırmalı
    - **BEKLENEN SONUÇ**: Test BAŞARILI (hata düzeltildi)
    - _Requirements: 4.1_

  - [x] 3.3 Koruma testlerinin hâlâ geçtiğini doğrula
    - **Property 2: Preservation** - Fotoğraf Ekleme Koruma
    - **ÖNEMLİ**: Görev 2'deki AYNI testleri yeniden çalıştır
    - **BEKLENEN SONUÇ**: Testler BAŞARILI (regresyon yok)

- [x] 4. H5 & H6 – Metin ve sticker aktif slide'a ekleme düzeltmesi

  - [x] 4.1 addText fonksiyonunda curSlide koordinat hesabı uygula
    - `addText` fonksiyonunda `slideW = RATIOS[ratio].width` hesapla
    - `targetLeft = (curSlide - 1) * slideW + slideW / 2` formülünü kullan
    - `injectJavaScript` çağrısında `left: ${targetLeft}` parametresini geç
    - WebView `addTxt` fonksiyonunu `opts.left` parametresini kabul edecek şekilde güncelle: `left: opts.left || ${w / 2}`
    - _Bug_Condition: `isBugCondition_H5(curSlide, addedLeft)` — `addedLeft = canvasToplamGenislik/2` (sabit merkez)_
    - _Expected_Behavior: `left = (curSlide-1)*slideWidth + slideWidth/2`_
    - _Preservation: `top`, `fontFamily`, `fontSize`, `fill`, `originX`, `originY` değerleri değişmemeli_
    - _Requirements: 5.1, 5.2_

  - [x] 4.2 addSticker fonksiyonunda curSlide koordinat hesabı uygula
    - `addSticker` fonksiyonunda `slideW = RATIOS[ratio].width` hesapla
    - `targetLeft = (curSlide - 1) * slideW + slideW / 2` formülünü kullan
    - `injectJavaScript` çağrısında `left` parametresini geç
    - WebView `addSticker` fonksiyonunu `left` parametresini kabul edecek şekilde güncelle: `left: left || ${w / 2}`
    - _Bug_Condition: `isBugCondition_H6(curSlide, addedLeft)` — H5 ile aynı kök neden_
    - _Expected_Behavior: `left = (curSlide-1)*slideWidth + slideWidth/2`_
    - _Preservation: `fontSize`, `originX`, `originY` değerleri değişmemeli_
    - _Requirements: 6.1, 6.2_

  - [x] 4.3 Hata koşulu keşif testinin artık geçtiğini doğrula
    - **Property 1: Expected Behavior** - Metin/Sticker Aktif Slide Koordinatı
    - **ÖNEMLİ**: Görev 1'deki AYNI testi yeniden çalıştır — yeni test yazma
    - `curSlide=3`, `ratio='portrait'` için `left=2700` olmalı
    - `∀ curSlide ∈ [1..slides], ∀ ratio` → `left = (curSlide-1)*slideWidth + slideWidth/2`
    - **BEKLENEN SONUÇ**: Test BAŞARILI (hata düzeltildi)
    - _Requirements: 5.1, 6.1_

  - [x] 4.4 Koruma testlerinin hâlâ geçtiğini doğrula
    - **Property 2: Preservation** - Metin/Sticker Parametre Koruma
    - **ÖNEMLİ**: Görev 2'deki AYNI testleri yeniden çalıştır
    - `top`, `fontFamily`, `fontSize`, `fill` değerlerinin değişmediğini doğrula
    - **BEKLENEN SONUÇ**: Testler BAŞARILI (regresyon yok)
    - _Requirements: 3.7_

- [x] 5. H2 – Slide geçişi düzeltmesi

  - [x] 5.1 WebView HTML'ine touch event dinleyicisi ekle
    - `html()` fonksiyonundaki `<script>` bloğuna touch event dinleyicileri ekle
    - `touchStartX` değişkeni ile `touchstart` olayını kaydet
    - `touchend` olayında `delta = changedTouches[0].clientX - touchStartX` hesapla
    - `Math.abs(delta) > 50` eşiği aşıldığında `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'slideChange', dir }))` gönder
    - `dir = delta < 0 ? 1 : -1` (sola swipe = ileri slide)
    - _Bug_Condition: `isBugCondition_H2(event)` — swipe dinleyici YOK AND curSlide güncellenmemiş_
    - _Expected_Behavior: swipe sonrası `postMessage` gönderilir, `curSlide` `±1` güncellenir_
    - _Preservation: Fabric.js nesne etkileşimleri (drag, resize) swipe dinleyiciden etkilenmemeli_
    - _Requirements: 2.1, 2.2_

  - [x] 5.2 onMsg handler'ında slideChange mesajını işle
    - `onMsg` fonksiyonunda `m.type === 'slideChange'` dalını ekle
    - `setCurSlide(prev => Math.max(1, Math.min(slides, prev + m.dir)))` ile sınır kontrolü yap
    - Dot indicator ve "Slide X of Y" göstergesi otomatik olarak güncellenecek (curSlide state'e bağlı)
    - _Requirements: 2.1, 2.2_

  - [x] 5.3 Hata koşulu keşif testinin artık geçtiğini doğrula
    - **Property 1: Expected Behavior** - Swipe Sonrası curSlide Güncelleme
    - **ÖNEMLİ**: Görev 1'deki AYNI testi yeniden çalıştır
    - Swipe simülasyonu sonrası `postMessage` gönderilmeli ve `curSlide` güncellenmeli
    - Sınır kontrolü: `curSlide=1`'de sola swipe → 0'a düşmemeli; `curSlide=slides`'da sağa swipe → `slides+1`'e çıkmamalı
    - **BEKLENEN SONUÇ**: Test BAŞARILI
    - _Requirements: 2.1, 2.2_

  - [x] 5.4 Koruma testlerinin hâlâ geçtiğini doğrula
    - **Property 2: Preservation** - Swipe Dışı Etkileşimler
    - **ÖNEMLİ**: Görev 2'deki AYNI testleri yeniden çalıştır
    - Undo/redo, bg değiştirme, nesne silme, export işlevlerinin etkilenmediğini doğrula
    - **BEKLENEN SONUÇ**: Testler BAŞARILI
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [x] 6. H1 – Selection box sadeleştirme

  - [x] 6.1 Fabric.js kontrol ayarlarını mobil için özelleştir
    - `html()` fonksiyonunda `MOBILE_CONTROLS` sabit nesnesini tanımla
    - `hasRotatingPoint: false` ile döndürme tutamacını gizle
    - `cornerColor: '#fff'`, `cornerStrokeColor: '#333'`, `borderColor: '#06FFB4'`, `cornerSize: 20`, `transparentCorners: false` ayarlarını uygula
    - `addImg`, `addTxt`, `addSticker` fonksiyonlarında `img.set({ ...MOBILE_CONTROLS })` / `t.set({ ...MOBILE_CONTROLS })` uygula
    - _Bug_Condition: `isBugCondition_H1(event)` — `hasControls=true` (varsayılan) AND `fabric.defaultControls` aktif_
    - _Expected_Behavior: Sade kenarlık, tutamaçsız veya minimal tutamaçlı seçim kutusu_
    - _Preservation: Nesne seçme, taşıma ve ölçeklendirme işlevleri korunmalı_
    - _Requirements: 1.1_

  - [x] 6.2 Koruma testlerinin hâlâ geçtiğini doğrula
    - **Property 2: Preservation** - Nesne Etkileşim Koruma
    - Nesne seçme, drag ile taşıma, ölçeklendirme işlevlerinin çalışmaya devam ettiğini doğrula
    - **BEKLENEN SONUÇ**: Testler BAŞARILI
    - _Requirements: 3.4_

- [x] 7. H3 – Preview thumbnail şeridi ekleme

  - [x] 7.1 preview.tsx'e thumbnail şeridi bileşeni ekle
    - `preview.tsx`'te `currentSlide` state'ini mevcut `onMomentumScrollEnd` ile senkronize tut
    - Ana `ScrollView`'ın altına yatay thumbnail `ScrollView` ekle
    - Her slide için `TouchableOpacity` içinde küçük `Image` bileşeni render et
    - Thumbnail boyutunu hesapla: `thumbW = (SCREEN_W - 40) / Math.min(slides, 5)`, `thumbH = thumbW * (dims.height / dims.width)`
    - `Image` bileşeninde `marginLeft: -(i * thumbW)` ile doğru slide dilimini göster
    - Aktif thumbnail için `borderColor: Colors.dark.accent`, `borderWidth: 2` vurgulama uygula
    - Thumbnail'a basıldığında büyük `ScrollView`'ı ilgili slide'a scroll et (`scrollRef` kullan)
    - _Bug_Condition: `isBugCondition_H3(state)` — `thumbnailScrollView YOK` AND `slides > 1`_
    - _Expected_Behavior: Alt thumbnail şeridi görünür, aktif slide vurgulanır, thumbnail'a basınca büyük view scroll eder_
    - _Preservation: Büyük swipeable slide görünümü ve dot indicator korunmalı_
    - _Requirements: 3.1_

  - [x] 7.2 Koruma testlerinin hâlâ geçtiğini doğrula
    - **Property 2: Preservation** - Preview Büyük Görünüm Koruma
    - Büyük swipeable slide görünümünün, dot indicator'ın ve "Looks Good" / "Edit More" butonlarının çalışmaya devam ettiğini doğrula
    - **BEKLENEN SONUÇ**: Testler BAŞARILI
    - _Requirements: 3.1, 3.5_

- [ ] 8. (Opsiyonel) Profesyonel carousel önerileri bölümü

  - [ ] 8.1 Editor veya preview ekranına carousel ipuçları bölümü ekle
    - Editörde veya preview'da "Pro Tips" / "Carousel Önerileri" bölümü için yer belirle
    - İçerik önerileri: ilk slide hook, tutarlı renk paleti, CTA son slide, 3-7 slide arası ideal uzunluk
    - Basit bir `Modal` veya `Collapsible` bileşeni ile göster
    - _Requirements: Opsiyonel_

- [x] 9. Kontrol noktası – Tüm testlerin geçtiğini doğrula
  - Tüm property testlerini çalıştır (keşif + koruma)
  - H1: Selection box sade görünüyor, nesne etkileşimleri çalışıyor
  - H2: Swipe ile slide geçişi çalışıyor, curSlide güncelleniyor, dot indicator doğru
  - H3: Preview'da thumbnail şeridi görünüyor, aktif slide vurgulanıyor
  - H4: Galeriden fotoğraf ekleniyor, Android'de cross-origin hatası yok
  - H5: Metin aktif slide'ın merkezine ekleniyor
  - H6: Sticker aktif slide'ın merkezine ekleniyor
  - Regresyon yok: undo/redo, bg değiştirme, silme, export, font seçimi çalışıyor
  - Soru çıkarsa kullanıcıya sor
