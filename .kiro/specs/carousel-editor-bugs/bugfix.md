# Bugfix Gereksinimleri Belgesi

## Giriş

Carousel Studio editöründe kullanıcı deneyimini bozan ve temel işlevselliği engelleyen altı kritik hata tespit edilmiştir. Bu hatalar; Fabric.js selection box'ının kafa karıştırıcı görünümü, slide geçişinin çalışmaması, preview ekranında thumbnail şeridinin eksikliği, galeriden fotoğraf eklenememesi, metin ve sticker'ların aktif slide yerine sabit bir konuma eklenmesi şeklinde özetlenebilir. Bu belgede her hatanın mevcut (hatalı) davranışı, beklenen (doğru) davranışı ve korunması gereken mevcut davranışlar tanımlanmaktadır.

---

## Hata Analizi

### Mevcut Davranış (Hata)

**H1 – Selection Box Kafa Karıştırıcılığı**

1.1 WHEN kullanıcı canvas üzerindeki herhangi bir nesneye (fotoğraf, metin, sticker) dokunduğunda THEN sistem Fabric.js'in varsayılan selection box'ını (köşe tutamaçları ve kenarlık çizgisi) gösteriyor ve kullanıcı bu kutunun ne işe yaradığını anlayamıyor

**H2 – Slide Geçişi Çalışmıyor**

2.1 WHEN kullanıcı canvas üzerinde yatay swipe hareketi yaptığında THEN sistem slide'lar arasında geçiş yapmıyor; tüm slide'lar tek büyük canvas olarak yan yana duruyor ve swipe ile aktif slide değişmiyor

2.2 WHEN kullanıcı editörde hangi slide'da olduğunu görmek istediğinde THEN sistem `curSlide` state'ini WebView'dan güncelleyemiyor; gösterge her zaman "Slide 1" olarak kalıyor

**H3 – Preview'da Thumbnail Şeridi Eksik**

3.1 WHEN kullanıcı preview ekranını açtığında THEN sistem yalnızca tek büyük swipeable görünüm sunuyor; tüm slide'ları küçük boyutta gösteren alt thumbnail/carousel şeridi görüntülenmiyor

**H4 – Galeriden Fotoğraf Eklenemiyor**

4.1 WHEN kullanıcı Photos sekmesinde "Add Photo" butonuna basıp galeriden bir fotoğraf seçtiğinde THEN sistem `file://` URI'ını WebView'a enjekte ediyor ancak WebView cross-origin kısıtlaması nedeniyle fotoğraf canvas'a eklenemiyor (özellikle Android'de)

**H5 – Metin Aktif Slide'a Değil Sabit Konuma Ekleniyor**

5.1 WHEN kullanıcı herhangi bir slide aktifken metin eklediğinde THEN sistem metni her zaman canvas'ın geometrik merkezine (`w/2`, `h/2`) ekliyor; bu koordinat her zaman ortadaki slide'a (örn. 3 slide'lı carousel'de 2. slide) denk geliyor

5.2 WHEN kullanıcı eklenen metin nesnesini yeniden boyutlandırmak veya konumlandırmak istediğinde THEN sistem pinch-to-zoom ve drag hareketlerine tepki vermiyor; boyut ve konum ayarlanamıyor

**H6 – Sticker Aktif Slide'a Değil Sabit Konuma Ekleniyor**

6.1 WHEN kullanıcı herhangi bir slide aktifken sticker eklediğinde THEN sistem sticker'ı her zaman canvas'ın geometrik merkezine (`w/2`, `h/2`) ekliyor; bu koordinat her zaman ortadaki slide'a denk geliyor

6.2 WHEN kullanıcı eklenen sticker nesnesini yeniden boyutlandırmak veya konumlandırmak istediğinde THEN sistem pinch-to-zoom ve drag hareketlerine tepki vermiyor; boyut ve konum ayarlanamıyor

---

### Beklenen Davranış (Doğru)

**H1 – Selection Box**

1.1 WHEN kullanıcı canvas üzerindeki bir nesneye dokunduğunda THEN sistem seçili nesneyi net biçimde vurgulamalı (örn. sadece kenarlık, tutamaçsız veya sade tutamaçlar) ve kullanıcı seçim durumunu kolayca anlayabilmeli

**H2 – Slide Geçişi**

2.1 WHEN kullanıcı canvas üzerinde yatay swipe hareketi yaptığında THEN sistem aktif slide'ı değiştirmeli; gösterge ve dot indicator güncel slide numarasını yansıtmalı

2.2 WHEN aktif slide değiştiğinde THEN sistem `curSlide` state'ini doğru şekilde güncellemeli ve alt gösterge (dot + "Slide X of Y" yazısı) anlık olarak doğru slide'ı göstermeli

**H3 – Preview Thumbnail Şeridi**

3.1 WHEN kullanıcı preview ekranını açtığında THEN sistem ana swipeable görünümün altında tüm slide'ları küçük thumbnail olarak gösteren yatay bir şerit sunmalı; aktif slide thumbnail'ı vurgulanmış olmalı

**H4 – Galeriden Fotoğraf Ekleme**

4.1 WHEN kullanıcı galeriden bir fotoğraf seçtiğinde THEN sistem fotoğrafı base64 formatına dönüştürmeli ve WebView'a cross-origin hatası olmadan enjekte etmeli; fotoğraf aktif slide'ın merkezine eklenebilmeli

**H5 – Metin Ekleme**

5.1 WHEN kullanıcı metin eklediğinde THEN sistem metni aktif slide'ın merkez koordinatına eklemeli; koordinat `(aktifSlideIndex * slideGenişliği) + slideGenişliği/2` formülüyle hesaplanmalı

5.2 WHEN kullanıcı eklenen metin nesnesine dokunup hareket ettirdiğinde THEN sistem drag ile konumlandırmayı desteklemeli; pinch hareketi ile ölçeklendirme yapılabilmeli

**H6 – Sticker Ekleme**

6.1 WHEN kullanıcı sticker eklediğinde THEN sistem sticker'ı aktif slide'ın merkez koordinatına eklemeli; koordinat `(aktifSlideIndex * slideGenişliği) + slideGenişliği/2` formülüyle hesaplanmalı

6.2 WHEN kullanıcı eklenen sticker nesnesine dokunup hareket ettirdiğinde THEN sistem drag ile konumlandırmayı desteklemeli; pinch hareketi ile ölçeklendirme yapılabilmeli

---

### Korunan Davranış (Regresyon Önleme)

3.1 WHEN kullanıcı preview ekranında slide'lar arasında swipe yaptığında THEN sistem mevcut büyük swipeable slide görünümünü korumaya devam etmeli

3.2 WHEN kullanıcı undo/redo butonlarına bastığında THEN sistem canvas geçmişini doğru şekilde geri/ileri almaya devam etmeli

3.3 WHEN kullanıcı background rengini değiştirdiğinde THEN sistem tüm canvas'ın arka plan rengini güncellemeye devam etmeli

3.4 WHEN kullanıcı seçili bir nesneyi silmek için X butonuna bastığında THEN sistem seçili nesneyi canvas'tan kaldırmaya devam etmeli

3.5 WHEN kullanıcı "Preview" butonuna bastığında THEN sistem canvas'ı export edip preview ekranına yönlendirmeye devam etmeli

3.6 WHEN kullanıcı editörden çıkmak istediğinde THEN sistem "Leave Editor?" uyarı diyaloğunu göstermeye devam etmeli

3.7 WHEN kullanıcı metin eklerken font ve boyut seçtiğinde THEN sistem seçilen font ailesi ve boyutu metne uygulamaya devam etmeli
