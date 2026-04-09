# Uygulama Planı

- [x] 1. Hata koşulu keşif testi yaz
  - **Property 1: Bug Condition** – Canvas Görünürlük, Konumlandırma ve Export Hataları
  - **ÖNEMLİ**: Bu testi düzeltme uygulanmadan ÖNCE yaz
  - **AMAÇ**: Hataların var olduğunu kanıtlayan counterexample'lar üret
  - **Kapsam**: `isBugCondition(X)` true döndüren tüm eylemler (view_canvas, open_editor, pinch_canvas, add_element, export_gallery)
  - **Scoped PBT Yaklaşımı**: Deterministik hatalar için somut başarısız durumları kapsama al
  - Test 1 – Canvas Ölçek: `scaleToFit` uygulanmadan canvas render edildiğinde `container.style.transform` boş/undefined olduğunu doğrula (S1)
  - Test 2 – İçerik Konumlandırma: `addTxt` çağrıldığında `top` değerinin `h/2` (örn. 675) olduğunu ve görünür alan dışında kaldığını doğrula (S4)
  - Test 3 – Pinch Zoom: Seçili nesne yokken pinch yapıldığında `canvasScale`'in değişmediğini doğrula (S3)
  - Test 4 – Export Sayısı: 3 slide için export çağrıldığında `savedCount === 1` döndüğünü doğrula (S5, beklenen: 3)
  - Test 5 – Slide Sınır Çizgileri: `.grid` div'lerinin `width: 2px` ve düşük opaklıkla tanımlı olduğunu doğrula (S2)
  - Testleri DÜZELTİLMEMİŞ kodda çalıştır
  - **BEKLENEN SONUÇ**: Testler BAŞARISIZ olur (bu doğru — hataların var olduğunu kanıtlar)
  - Bulunan counterexample'ları belgele (kök neden analizini doğrulamak için)
  - Görev; test yazıldığında, çalıştırıldığında ve başarısızlık belgelendiğinde tamamlanmış sayılır
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Preservation property testlerini yaz (düzeltme uygulanmadan ÖNCE)
  - **Property 2: Preservation** – Mevcut Editör Davranışları
  - **ÖNEMLİ**: Gözlem-önce metodolojisini uygula
  - `isBugCondition(X)` false döndüren eylemler için DÜZELTİLMEMİŞ kodda davranışı gözlemle
  - Gözlem 1 – Undo/Redo: `undoStack` ve `redoStack` doğru güncelleniyor, geçmiş korunuyor
  - Gözlem 2 – Nesne Sürükleme: Fabric.js `object:modified` event'i tetikleniyor, nesne koordinatları değişiyor
  - Gözlem 3 – Arka Plan Rengi: `setBg(color)` çağrısı `c.backgroundColor`'ı güncelliyor
  - Gözlem 4 – Template Yükleme: `params.templateId` ile `slides` ve `ratio` state'leri doğru set ediliyor
  - Gözlem 5 – Preview Export: `exportCanvas()` çağrısı `toDataURL` ile PNG üretiyor ve `onExport` tetikleniyor
  - Gözlem 6 – Nesne Silme: `deleteSel()` seçili nesneyi canvas'tan kaldırıyor
  - Property-based testler yaz: rastgele undo/redo sekansları, rastgele renk değerleri, rastgele template kombinasyonları
  - Testleri DÜZELTİLMEMİŞ kodda çalıştır
  - **BEKLENEN SONUÇ**: Testler BAŞARILI olur (bu temel davranışı korumak için referans noktası)
  - Görev; testler yazıldığında, çalıştırıldığında ve DÜZELTİLMEMİŞ kodda geçtiğinde tamamlanmış sayılır
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Editor canvas yeniden tasarımı düzeltmesi

  - [x] 3.1 S1 + S2 – Canvas ölçekleme ve slide şeridi (html() içinde CSS transform + kesikli çizgiler)
    - `html()` fonksiyonunda canvas oluşturulduktan sonra `scaleToFit = window.innerWidth / totalCanvasWidth` hesapla
    - Container'a `transform: scale(scaleToFit)` ve `transformOrigin: 'top left'` uygula
    - `canvasScale` state değişkenini `scaleToFit` ile başlat
    - `.grid` CSS'ini güncelle: `width: 3px`, `rgba(255,255,255,0.8)` opaklık, 12px/24px kesikli desen
    - _Bug_Condition: isBugCondition(X) where X.action = 'view_canvas' OR X.action = 'open_editor'_
    - _Expected_Behavior: scaleToFit * totalCanvasWidth === SCREEN_W; slide sınırları 3px kesikli çizgilerle görünür_
    - _Preservation: Undo/redo, nesne sürükleme, arka plan rengi, template yükleme etkilenmemeli (3.1–3.7)_
    - _Requirements: 2.1, 2.2_

  - [x] 3.2 S4 – İçerik konumlandırma (visibleCenterY hesabı)
    - `addTxt`, `addSticker`, `addImg` fonksiyonlarında `top: h/2` yerine `visibleCenterY = (window.innerHeight / 2) / canvasScale` kullan
    - Her üç fonksiyonda da `top` parametresini `visibleCenterY` ile güncelle
    - _Bug_Condition: isBugCondition(X) where X.action = 'add_element'_
    - _Expected_Behavior: top = (window.innerHeight / 2) / canvasScale; içerik görünür alanın ortasına düşer_
    - _Preservation: Nesne sürükleme ve serbest konumlandırma korunmalı (3.2)_
    - _Requirements: 2.4_

  - [x] 3.3 S3 – Canvas zoom (pinch handler'ı canvas zoom moduna genişlet)
    - `touchmove` handler'ında `c.getActiveObject()` kontrolü ekle
    - Seçili nesne varsa: mevcut nesne ölçeklendirme mantığını koru (3.3 preservation)
    - Seçili nesne yoksa: `canvasScale = Math.max(scaleToFit, Math.min(scaleToFit * 5, canvasScale * ratio))` hesapla ve `container.style.transform = scale(canvasScale)` uygula
    - _Bug_Condition: isBugCondition(X) where X.action = 'pinch_canvas'_
    - _Expected_Behavior: seçili nesne yoksa canvas zoom; seçili nesne varsa nesne ölçeklendirme_
    - _Preservation: Seçili nesne üzerinde pinch → nesne ölçeklendirme korunmalı (3.3)_
    - _Requirements: 2.3, 3.3_

  - [x] 3.4 S5 – Export döngüsü (her slide ayrı PNG)
    - `app/export.tsx` içinde `imageData`'nın gerçek piksel genişliğini al
    - `cropW = imageWidth / slides` formülünü kullan (`dims.width` yerine)
    - Her slide için `cropX = i * cropW` ile doğru crop koordinatını hesapla
    - _Bug_Condition: isBugCondition(X) where X.action = 'export_gallery'_
    - _Expected_Behavior: slideCount kadar ayrı PNG üretilir; her PNG yalnızca ilgili slide'ı içerir_
    - _Preservation: Preview export (toDataURL → preview ekranı) etkilenmemeli (3.5)_
    - _Requirements: 2.5_

  - [x] 3.5 Hata koşulu keşif testinin artık geçtiğini doğrula
    - **Property 1: Expected Behavior** – Canvas Görünürlük, Konumlandırma ve Export Hataları
    - **ÖNEMLİ**: Görev 1'deki AYNI testi yeniden çalıştır — yeni test yazma
    - Görev 1'deki test beklenen davranışı kodluyor; geçmesi düzeltmenin doğru çalıştığını kanıtlar
    - Hata koşulu keşif testini çalıştır
    - **BEKLENEN SONUÇ**: Test BAŞARILI olur (hata giderildi)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.6 Preservation testlerinin hâlâ geçtiğini doğrula
    - **Property 2: Preservation** – Mevcut Editör Davranışları
    - **ÖNEMLİ**: Görev 2'deki AYNI testleri yeniden çalıştır — yeni test yazma
    - Preservation property testlerini çalıştır
    - **BEKLENEN SONUÇ**: Testler BAŞARILI olur (regresyon yok)
    - Tüm testlerin düzeltme sonrası da geçtiğini onayla

- [x] 4. Kontrol Noktası – Tüm testlerin geçtiğinden emin ol
  - Tüm testleri çalıştır ve geçtiğini doğrula
  - Soru çıkarsa kullanıcıya danış
