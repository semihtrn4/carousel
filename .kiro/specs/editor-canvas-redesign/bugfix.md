# Bugfix Gereksinimleri Belgesi

## Giriş

Bu belge, `app/editor.tsx` içindeki Fabric.js tabanlı canvas editörünün beş temel sorununu ele almaktadır. Sorunlar; canvas içeriğinin görünürlüğü, slide görünüm düzeni, zoom desteği, eklenen içeriğin konumlandırılması ve export sırasında slide'ların ayrı kaydedilmesi ile ilgilidir. Bu hatalar, kullanıcının editörde ne yaptığını görmesini ve sonuçları doğru şekilde dışa aktarmasını engellemektedir.

---

## Hata Analizi

### Mevcut Davranış (Hata)

**S1 – Canvas içeriği görünmüyor**

1.1 WHEN kullanıcı editörde resim, yazı veya emoji eklediğinde THEN sistem eklenen içeriği WebView canvas'ında görünür şekilde gösteremiyor; WebView boyutu ve ölçekleme yanlış olduğundan canvas ya çok küçük görünüyor ya da ekrana sığmıyor.

**S2 – Slide'lar ayrı ayrı gösteriliyor**

1.2 WHEN kullanıcı editörü açtığında THEN sistem slide'ları "1 of 3", "2 of 3" şeklinde ayrı ayrı gösteriyor; tüm slide'ların tek yatay şerit olarak görüntülenmesi gerektiği hâlde canvas tek parça olarak sunulmuyor.

**S3 – Canvas zoom desteği yok**

1.3 WHEN kullanıcı editör canvas'ı üzerinde iki parmakla pinch hareketi yaptığında THEN sistem canvas'ın kendisini zoom etmiyor; mevcut pinch-to-zoom yalnızca seçili nesneyi ölçeklendiriyor, canvas görünümünü değiştirmiyor.

**S4 – Eklenen içerik canvas'ın altına geliyor**

1.4 WHEN kullanıcı resim, yazı veya emoji eklediğinde THEN sistem içeriği canvas'ın en altına yerleştiriyor; içerik aktif slide'ın ortasına yerleştirilmesi gerekirken yanlış konuma düşüyor.

**S5 – Export'ta slide'lar ayrı kaydedilmiyor**

1.5 WHEN kullanıcı "Save to Gallery" butonuna bastığında THEN sistem tüm carousel'i tek bir PNG olarak kaydediyor; her slide'ın ayrı PNG dosyası olarak kaydedilmesi gerekirken tek dosya üretiliyor.

---

### Beklenen Davranış (Doğru)

**S1 – Canvas içeriği görünmeli**

2.1 WHEN kullanıcı editörde resim, yazı veya emoji eklediğinde THEN sistem eklenen içeriği WebView canvas'ında anında ve doğru ölçekte görünür hâle GETİRMELİDİR; WebView ekran genişliğine sığacak şekilde ölçeklenmeli, canvas içeriği kullanıcıya net biçimde gösterilmelidir.

**S2 – Tüm slide'lar tek yatay şerit olarak görünmeli**

2.2 WHEN kullanıcı editörü açtığında THEN sistem tüm slide'ları tek bir yatay canvas şeridi olarak GÖSTERMELİDİR; slide sınırları kesikli dikey çizgilerle belirtilmeli, kullanıcı tüm slide'ları aynı anda görebilmelidir.

**S3 – Canvas zoom desteklenmeli**

2.3 WHEN kullanıcı editör canvas'ı üzerinde iki parmakla pinch hareketi yaptığında THEN sistem canvas görünümünü yakınlaştırmalı veya uzaklaştırmalıdır (pinch-to-zoom); zoom işlemi canvas'ın tamamına uygulanmalı, nesne ölçeklendirmesinden bağımsız çalışmalıdır.

**S4 – Eklenen içerik aktif slide'ın ortasına gelmeli**

2.4 WHEN kullanıcı resim, yazı veya emoji eklediğinde THEN sistem içeriği aktif slide'ın yatay ve dikey merkezine YERLEŞTİRMELİDİR; başlangıç konumu `(curSlide - 1) * slideWidth + slideWidth / 2` formülüyle hesaplanmalıdır.

**S5 – Export'ta her slide ayrı PNG olarak kaydedilmeli**

2.5 WHEN kullanıcı "Save to Gallery" butonuna bastığında THEN sistem her slide'ı ayrı bir PNG dosyası olarak KAYDETMELİDİR; `slideCount` kadar dosya üretilmeli, her dosya yalnızca ilgili slide'ın içeriğini içermelidir.

---

### Değişmemesi Gereken Davranış (Regresyon Önleme)

3.1 WHEN kullanıcı editörde undo/redo butonlarına bastığında THEN sistem canvas geçmişini doğru şekilde GERİ ALMAYA / YENİDEN UYGULAMAYA DEVAM ETMELİDİR.

3.2 WHEN kullanıcı bir nesneyi seçip sürüklediğinde THEN sistem nesnenin canvas üzerinde serbest konumlandırılmasına DEVAM ETMELİDİR.

3.3 WHEN kullanıcı seçili bir nesne üzerinde pinch hareketi yaptığında THEN sistem nesneyi ölçeklendirmeye DEVAM ETMELİDİR (canvas zoom'undan bağımsız olarak).

3.4 WHEN kullanıcı arka plan rengi seçtiğinde THEN sistem tüm canvas'ın arka plan rengini güncellemesine DEVAM ETMELİDİR.

3.5 WHEN kullanıcı "Preview" butonuna bastığında THEN sistem canvas'ı PNG olarak dışa aktarıp preview ekranına yönlendirmeye DEVAM ETMELİDİR.

3.6 WHEN kullanıcı editörde bir nesneyi sildiğinde THEN sistem seçili nesneyi canvas'tan kaldırmaya DEVAM ETMELİDİR.

3.7 WHEN kullanıcı template seçerek editörü açtığında THEN sistem template'in slide sayısını ve oranını doğru şekilde yüklemeye DEVAM ETMELİDİR.

---

## Hata Koşulu Özeti

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type EditorAction
  OUTPUT: boolean

  RETURN (
    X.action = 'view_canvas'       // S1: canvas görünürlük sorunu
    OR X.action = 'open_editor'    // S2: slide düzeni sorunu
    OR X.action = 'pinch_canvas'   // S3: canvas zoom eksikliği
    OR X.action = 'add_element'    // S4: yanlış konumlandırma
    OR X.action = 'export_gallery' // S5: tek PNG export sorunu
  )
END FUNCTION

// Fix Checking
FOR ALL X WHERE isBugCondition(X) DO
  result ← editor'(X)
  ASSERT result satisfies expected behavior (2.1 – 2.5)
END FOR

// Preservation Checking
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT editor(X) = editor'(X)
END FOR
```
