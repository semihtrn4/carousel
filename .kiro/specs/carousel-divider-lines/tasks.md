# Implementation Plan

- [x] 1. Bug condition exploration testi yaz
  - **Property 1: Bug Condition** - Açık Arka Planda Ghost Line Görünmezlik Hatası
  - **ÖNEMLİ**: Bu property-based testi düzeltme yapılmadan ÖNCE yaz
  - **AMAÇ**: Bug'ın varlığını somut counterexample'larla kanıtla
  - **Scoped PBT Yaklaşımı**: Bug condition'ı somut başarısız case'lere daralt: `backgroundColor` açık renk (`#FFFFFF`, `#F5F5F0`, `#FFE4E1`) iken ghost line stroke değeri
  - `__tests__/carousel-divider-lines-exploration.test.ts` dosyasına yaz
  - `isLightColor` yardımcı fonksiyonunu simüle et (henüz mevcut değil — beklenen davranışı kodla)
  - Ghost line oluşturma mantığını simüle et: mevcut kod `stroke: 'rgba(255,255,255,0.7)'` sabit değeri kullanıyor
  - Test: açık arka plan (`#FFFFFF`) ile ghost line oluşturulduğunda `stroke` değerinin `rgba(0,0,0,0.7)` olmasını assert et
  - Test: `setBg('#F5F5F0')` çağrısı sonrası ghost line stroke'unun `rgba(0,0,0,0.7)` olmasını assert et
  - Test: pastel renk (`#FFE4E1`) için de aynı davranışı assert et
  - Testi DÜZELTILMEMIŞ kod üzerinde çalıştır
  - **BEKLENEN SONUÇ**: Test BAŞARISIZ olur (bu doğru — bug'ın varlığını kanıtlar)
  - Bulunan counterexample'ları belgele (örn. `stroke` değeri `rgba(255,255,255,0.7)` olarak kalıyor)
  - Görev tamamlandı sayılır: test yazıldı, çalıştırıldı ve başarısızlık belgelendi
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Preservation property testlerini yaz (düzeltme yapılmadan ÖNCE)
  - **Property 2: Preservation** - Koyu Arka Planda Ghost Line Özellikleri Korunur
  - **ÖNEMLİ**: Observation-first metodolojisini uygula
  - `__tests__/carousel-divider-lines-preservation.test.ts` dosyasına yaz
  - Gözlem: koyu arka plan (`#000000`, `#0D0D0D`, `#1A1A1A`) ile ghost line `stroke` değeri `rgba(255,255,255,0.7)` olarak kalıyor — bu doğru davranış
  - Gözlem: ghost line'ların `selectable: false`, `evented: false`, `excludeFromExport: true` özellikleri değişmiyor
  - Gözlem: `strokeDashArray: [20, 15]` ve `strokeWidth: 3` değerleri sabit kalıyor
  - Gözlem: `hideGrid`/`showGrid` çağrıları `visible` özelliğini doğru toggle ediyor
  - Property-based test: rastgele koyu hex renkleri üret → ghost line her zaman `rgba(255,255,255,0.7)` olmalı
  - Property-based test: tüm ghost line özellikleri (`selectable`, `evented`, `excludeFromExport`, `strokeDashArray`, `strokeWidth`) değişmeden kalmalı
  - Testi DÜZELTILMEMIŞ kod üzerinde çalıştır
  - **BEKLENEN SONUÇ**: Testler GEÇER (bu doğru — korunacak baseline davranışı doğrular)
  - Görev tamamlandı sayılır: testler yazıldı, çalıştırıldı ve geçtiği doğrulandı
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Carousel divider lines renk kontrastı düzeltmesi

  - [x] 3.1 `isLightColor` ve `getContrastLineColor` yardımcı fonksiyonlarını ekle
    - `app/editor.tsx` içindeki `html()` fonksiyonunun inline JavaScript template'ine ekle
    - `isLightColor(color)`: hex veya rgb renk değerini parse et, relative luminance hesapla (`0.299*r + 0.587*g + 0.114*b) / 255`), 0.5 eşiğinin üzerindeyse `true` döndür
    - `getContrastLineColor(bgColor)`: `isLightColor` sonucuna göre `rgba(0,0,0,0.7)` veya `rgba(255,255,255,0.7)` döndür
    - _Bug_Condition: `isBugCondition(X)` — `isLightColor(X.backgroundColor) = true` AND `ghostLineStroke = 'rgba(255,255,255,0.7)'`_
    - _Requirements: 2.1, 2.2_

  - [x] 3.2 Ghost line oluşturma kısmını dinamik renkle güncelle
    - `html()` içindeki ghost line döngüsünü güncelle
    - `const initialBg = '${selColor}';` ve `const initialLineColor = getContrastLineColor(initialBg);` ekle
    - `stroke: 'rgba(255,255,255,0.7)'` sabit değerini `stroke: initialLineColor` ile değiştir
    - _Bug_Condition: ghost line oluşturulurken `selColor` arka plan rengine göre kontrast renk kullanılmalı_
    - _Expected_Behavior: açık arka planda `rgba(0,0,0,0.7)`, koyu arka planda `rgba(255,255,255,0.7)`_
    - _Requirements: 2.2, 2.4_

  - [x] 3.3 `setBg` fonksiyonunu ghost line renklerini güncelleyecek şekilde düzelt
    - `window.setBg` implementasyonunu güncelle
    - Mevcut: `window.setBg = (color) => { c.setBackgroundColor(color, c.renderAll.bind(c)); };`
    - Yeni: callback içinde `getContrastLineColor(color)` ile `lineColor` hesapla, `ghostLines.forEach(l => l.set({ stroke: lineColor }))` ile tüm ghost line'ları güncelle, ardından `c.renderAll()` çağır
    - _Bug_Condition: `setBg` çağrısı sonrası ghost line rengi güncellenmiyordu_
    - _Expected_Behavior: arka plan değiştiğinde ghost line rengi anında kontrast renge güncellenir_
    - _Preservation: `selectable`, `evented`, `excludeFromExport`, `strokeDashArray`, `strokeWidth` özellikleri değişmez_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

  - [x] 3.4 Bug condition exploration testinin artık geçtiğini doğrula
    - **Property 1: Expected Behavior** - Açık Arka Planda Ghost Line Kontrast Rengi
    - **ÖNEMLİ**: Görev 1'deki AYNI testi yeniden çalıştır — yeni test yazma
    - `__tests__/carousel-divider-lines-exploration.test.ts` testlerini çalıştır
    - **BEKLENEN SONUÇ**: Testler GEÇER (bug düzeltildi)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.5 Preservation testlerinin hâlâ geçtiğini doğrula
    - **Property 2: Preservation** - Ghost Line Özellikleri Korunur
    - **ÖNEMLİ**: Görev 2'deki AYNI testleri yeniden çalıştır — yeni test yazma
    - `__tests__/carousel-divider-lines-preservation.test.ts` testlerini çalıştır
    - **BEKLENEN SONUÇ**: Testler GEÇER (regresyon yok)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint — Tüm testlerin geçtiğini doğrula
  - Tüm testleri çalıştır, soru çıkarsa kullanıcıya sor
