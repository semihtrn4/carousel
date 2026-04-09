# Bugfix Requirements Document

## Introduction

Editor canvas'ta birden fazla carousel slide'ı yan yana gösterildiğinde, slide'ları birbirinden ayıran kesik çizgiler (divider/ghost lines) her zaman sabit beyaz renkte (`rgba(255,255,255,0.7)`) çizilmektedir. Bu durum, canvas arka planı açık renk (örn. beyaz) olduğunda çizgilerin görünmez hale gelmesine yol açmaktadır. Çizgi rengi, canvas arka plan rengine göre kontrast sağlayacak şekilde dinamik olarak belirlenmelidir.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN canvas arka plan rengi beyaz veya açık renk olduğunda THEN sistem divider çizgilerini `rgba(255,255,255,0.7)` (beyaz) renkte çizer ve çizgiler görünmez olur

1.2 WHEN canvas arka plan rengi değiştirildiğinde (setBg çağrıldığında) THEN sistem mevcut ghost line'ların rengini güncellemez, çizgiler eski renkte kalmaya devam eder

1.3 WHEN birden fazla slide içeren bir proje yüklendiğinde THEN sistem divider çizgilerini her zaman sabit beyaz renkte oluşturur, arka plan rengini dikkate almaz

### Expected Behavior (Correct)

2.1 WHEN canvas arka plan rengi koyu (örn. siyah, koyu gri) olduğunda THEN sistem divider çizgilerini beyaz renkte (`rgba(255,255,255,0.7)`) göstermelidir (SHA: yüksek kontrast)

2.2 WHEN canvas arka plan rengi açık (örn. beyaz, açık gri, pastel) olduğunda THEN sistem divider çizgilerini siyah renkte (`rgba(0,0,0,0.7)`) göstermelidir (SHA: yüksek kontrast)

2.3 WHEN kullanıcı `setBg` ile arka plan rengini değiştirdiğinde THEN sistem mevcut tüm ghost line'ların rengini yeni arka plan rengine göre anında güncellemeli ve canvas'ı yeniden render etmelidir

2.4 WHEN yeni bir proje açılırken başlangıç arka plan rengi belirlenmişse THEN sistem ghost line'ları o arka plan rengine uygun kontrast renkte oluşturmalıdır

### Unchanged Behavior (Regression Prevention)

3.1 WHEN ghost line'lar canvas üzerinde gösterildiğinde THEN sistem bu çizgilerin `selectable: false` ve `evented: false` özelliklerini korumaya devam etmelidir (kullanıcı tarafından seçilememeliler)

3.2 WHEN export işlemi gerçekleştirildiğinde THEN sistem ghost line'ları export edilen görsele dahil etmemeye devam etmelidir (`excludeFromExport: true`)

3.3 WHEN ghost line'lar gösterildiğinde THEN sistem kesik çizgi stilini (`strokeDashArray: [20, 15]`) ve çizgi kalınlığını (`strokeWidth: 3`) korumaya devam etmelidir

3.4 WHEN `hideGrid` ve `showGrid` fonksiyonları çağrıldığında THEN sistem ghost line'ların görünürlüğünü doğru şekilde toggle etmeye devam etmelidir

3.5 WHEN slide sayısı 1'den fazla olduğunda THEN sistem her slide sınırına (i * slideWidth) bir divider çizgisi eklemeye devam etmelidir

---

## Bug Condition (Pseudocode)

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type CanvasState { backgroundColor: string }
  OUTPUT: boolean

  // Bug, arka plan rengi açık olduğunda ghost line rengi beyaz sabit kaldığında tetiklenir
  RETURN isLightColor(X.backgroundColor) = true
    AND ghostLineStroke = 'rgba(255,255,255,0.7)'
END FUNCTION
```

```pascal
// Property: Fix Checking - Kontrast Çizgi Rengi
FOR ALL X WHERE isBugCondition(X) DO
  result ← renderGhostLines'(X)
  ASSERT ghostLineStroke = 'rgba(0,0,0,0.7)'  // Açık arka planda siyah çizgi
END FOR

// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT renderGhostLines(X) = renderGhostLines'(X)  // Koyu arka planda davranış değişmez
END FOR
```
