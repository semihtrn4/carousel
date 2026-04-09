// FILE_VERSION_1744065307
import { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ArrowLeft, Undo, Redo, Image as ImageIcon, Type, Sticker, Palette, Eye, X, Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { TEMPLATES, STICKERS, FONTS } from '@/constants/templates';

const TABS = [
  { id: 'photos', icon: ImageIcon, label: 'Photos' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'stickers', icon: Sticker, label: 'Stickers' },
  { id: 'background', icon: Palette, label: 'BG' },
];

const COLORS_LIST = [
  '#FFFFFF', '#000000', '#FF006E', '#8338EC', '#3A86FF', '#06FFB4',
  '#FFBE0B', '#FB5607', '#F5F5F0', '#FFE4E1', '#E6E6FA', '#98FB98',
];

const RATIOS = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
};

const EDITOR_VERSION = 'carousel_v1';

export default function EditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const webRef = useRef<WebView>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('photos');
  const [slides, setSlides] = useState(parseInt(params.slides as string) || 3);
  const [ratio, setRatio] = useState<'square' | 'portrait' | 'story' | 'landscape'>((params.ratio as any) || 'portrait');
  const [canvasW, setCanvasW] = useState(3240);
  const [canvasH, setCanvasH] = useState(1350);
  const [selColor, setSelColor] = useState('#F5F5F0');
  const [textVal, setTextVal] = useState('');
  const [selFont, setSelFont] = useState(FONTS[0]);
  const [fontSize, setFontSize] = useState(48);
  const [showText, setShowText] = useState(false);
  const [curSlide, setCurSlide] = useState(1);

  useEffect(() => {
    const dims = RATIOS[ratio];
    setCanvasW(dims.width * slides);
    setCanvasH(dims.height);
  }, [slides, ratio]);

  useEffect(() => {
    if (params.templateId) {
      const t = TEMPLATES.find((x) => x.id === params.templateId);
      if (t) {
        setSlides(t.slides);
        setRatio(t.ratio);
      }
    }
  }, [params.templateId]);

  const html = () => {
    const dims = RATIOS[ratio];
    const w = dims.width * slides;
    const h = dims.height;

    return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #1a1a1a; overflow: hidden; width: 100vw; height: 100vh; }
#wrapper { width: 100vw; height: 100vh; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: flex-start; }
#container { position: absolute; top: 0; left: 0; transform-origin: top left; }
.grid { position: absolute; top: 0; width: 3px; height: 100%; background: repeating-linear-gradient(to bottom, rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 12px, transparent 12px, transparent 24px); pointer-events: none; z-index: 10; }
canvas { display: block; }
</style>
</head>
<body>
<div id="wrapper"><div id="container"><canvas id="c"></canvas></div></div>
<script>
const c = new fabric.Canvas('c', { width: ${w}, height: ${h}, backgroundColor: '${selColor}', preserveObjectStacking: true });
const cont = document.getElementById('container');
for (let i = 1; i < ${slides}; i++) { const line = document.createElement('div'); line.className = 'grid'; line.style.left = (i * ${dims.width}) + 'px'; cont.appendChild(line); }
const MOBILE_CONTROLS = { cornerColor: '#fff', cornerStrokeColor: '#333', borderColor: '#06FFB4', cornerSize: 20, transparentCorners: false, hasRotatingPoint: false };
let undoStack = [], redoStack = [];
function save() { undoStack.push(JSON.stringify(c)); redoStack = []; if (undoStack.length > 20) undoStack.shift(); }
c.on('object:added', save); c.on('object:modified', save); c.on('object:removed', save);
const scaleToFit = window.innerWidth / ${w};
let canvasScale = scaleToFit;
c.setZoom(scaleToFit);
c.setWidth(window.innerWidth);
c.setHeight(${h} * scaleToFit);
cont.style.transform = '';
function getVisibleCenterY() { return (c.getHeight() / 2) / c.getZoom(); }
window.addImg = (src, targetLeft) => { fabric.Image.fromURL(src, (img) => { const scale = Math.min(${dims.width} / img.width, ${h} / img.height * 0.5); img.set({ left: targetLeft || (${w / 2}), top: getVisibleCenterY(), scaleX: scale, scaleY: scale, ...MOBILE_CONTROLS }); c.add(img); c.setActiveObject(img); c.renderAll(); }); };
window.addTxt = (txt, opts) => { const t = new fabric.Text(txt, { left: opts.left || ${w / 2}, top: getVisibleCenterY(), fontFamily: opts.fontFamily || 'Arial', fontSize: opts.fontSize || 48, fill: opts.color || '#000', textAlign: 'center', originX: 'center', originY: 'center', ...MOBILE_CONTROLS }); c.add(t); c.setActiveObject(t); c.renderAll(); };
window.addSticker = (emoji, left) => { const t = new fabric.Text(emoji, { left: left || ${w / 2}, top: getVisibleCenterY(), fontSize: 100, originX: 'center', originY: 'center', ...MOBILE_CONTROLS }); c.add(t); c.setActiveObject(t); c.renderAll(); };
window.setBg = (color) => { c.setBackgroundColor(color, c.renderAll.bind(c)); };
window.undo = () => { if (undoStack.length > 1) { redoStack.push(undoStack.pop()); const s = undoStack[undoStack.length - 1]; c.loadFromJSON(s, c.renderAll.bind(c)); } };
window.redo = () => { if (redoStack.length > 0) { const s = redoStack.pop(); undoStack.push(s); c.loadFromJSON(s, c.renderAll.bind(c)); } };
window.exportCanvas = () => { const data = c.toDataURL({ format: 'png', quality: 1, multiplier: 1 }); window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'export', data })); };
window.deleteSel = () => { const a = c.getActiveObject(); if (a) { c.remove(a); c.discardActiveObject(); c.renderAll(); } };
let touchStartX = 0;
let touchStartY = 0;
let isDragging = false;
let lastPinchDist = 0;
let isPinching = false;
document.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    isPinching = true;
    isDragging = false;
    lastPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
  } else {
    isPinching = false;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = false;
  }
});
document.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    isPinching = true;
    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    const obj = c.getActiveObject();
    if (obj && lastPinchDist > 0) {
      const ratio = dist / lastPinchDist;
      const newScaleX = Math.max(0.1, Math.min(10, (obj.scaleX || 1) * ratio));
      const newScaleY = Math.max(0.1, Math.min(10, (obj.scaleY || 1) * ratio));
      obj.set({ scaleX: newScaleX, scaleY: newScaleY });
      obj.setCoords();
      c.renderAll();
    } else if (lastPinchDist > 0) {
      const ratio = dist / lastPinchDist;
      const newZoom = Math.max(scaleToFit, Math.min(scaleToFit * 5, c.getZoom() * ratio));
      c.setZoom(newZoom);
      c.setWidth(window.innerWidth);
      c.setHeight(${h} * newZoom);
      canvasScale = newZoom;
    }
    lastPinchDist = dist;
  } else if (!isPinching) {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (dx > 10 || dy > 10) isDragging = true;
  }
});
document.addEventListener('touchend', (e) => {
  if (isPinching) {
    if (e.touches.length < 2) {
      isPinching = false;
      lastPinchDist = 0;
      const obj = c.getActiveObject();
      if (obj) { c.fire('object:modified', { target: obj }); }
    }
    return;
  }
  if (!isDragging) return;
  const delta = e.changedTouches[0].clientX - touchStartX;
  const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
  const THRESHOLD = 50;
  if (Math.abs(delta) > THRESHOLD && Math.abs(delta) > dy) {
    const dir = delta < 0 ? 1 : -1;
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'slideChange', dir }));
  }
});
window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
</script>
</body>
</html>`;
  };

  const onMsg = (e: WebViewMessageEvent) => {
    try {
      const m = JSON.parse(e.nativeEvent.data);
      if (m.type === 'ready') setLoading(false);
      else if (m.type === 'export') onExport(m.data);
      else if (m.type === 'slideChange') {
        setCurSlide(prev => Math.max(1, Math.min(slides, prev + m.dir)));
      }
    } catch (err) { console.error('Msg error:', err); }
  };

  const pickImg = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.8 });
    if (!res.canceled && res.assets[0]) {
      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          res.assets[0].uri,
          [],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        const dataUri = `data:image/jpeg;base64,${manipResult.base64}`;
        const slideW = RATIOS[ratio].width;
        const targetLeft = (curSlide - 1) * slideW + slideW / 2;
        webRef.current?.injectJavaScript(`window.addImg('${dataUri}', ${targetLeft}); true;`);
      } catch (err) {
        console.error('Image load error:', err);
      }
    }
  };

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

  const setBg = (color: string) => {
    setSelColor(color);
    webRef.current?.injectJavaScript(`window.setBg('${color}'); true;`);
  };

  const onExport = (data: string) => {
    router.push({ pathname: '/preview', params: { imageData: data, slides: slides.toString(), ratio, width: canvasW.toString(), height: canvasH.toString() } });
  };

  const goPreview = () => webRef.current?.injectJavaScript(`window.exportCanvas(); true;`);

  const goBack = () => {
    Alert.alert('Leave Editor?', 'Your changes will be lost.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const toolbar = () => {
    switch (activeTab) {
      case 'photos': return (
        <View style={eStyles.panel}>
          <TouchableOpacity style={eStyles.actionBtn} onPress={pickImg}>
            <ImageIcon size={24} color={Colors.dark.background} />
            <Text style={eStyles.actionText}>Add Photo</Text>
          </TouchableOpacity>
          <Text style={eStyles.hint}>Tap to select photos from gallery</Text>
        </View>
      );
      case 'text': return (
        <View style={eStyles.panel}>
          <TouchableOpacity style={eStyles.actionBtn} onPress={() => setShowText(true)}>
            <Type size={24} color={Colors.dark.background} />
            <Text style={eStyles.actionText}>Add Text</Text>
          </TouchableOpacity>
          <Text style={eStyles.hint}>Add and customize text</Text>
        </View>
      );
      case 'stickers': return (
        <View style={eStyles.panel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={eStyles.stickerRow}>
              {STICKERS.map((s) => (
                <TouchableOpacity key={s.id} style={eStyles.stickerBtn} onPress={() => addSticker(s.emoji)}>
                  <Text style={eStyles.stickerEmoji}>{s.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      );
      case 'background': return (
        <View style={eStyles.panel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={eStyles.colorRow}>
              {COLORS_LIST.map((c) => (
                <TouchableOpacity key={c} style={[eStyles.colorBtn, { backgroundColor: c }, selColor === c && eStyles.colorActive]} onPress={() => setBg(c)}>
                  {selColor === c && <Check size={16} color={c === '#FFFFFF' ? '#000' : '#fff'} />}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      );
      default: return <View style={eStyles.panel}><Text style={eStyles.hint}>Coming soon</Text></View>;
    }
  };

  return (
    <SafeAreaView style={eStyles.container} edges={['top']}>
      <View style={eStyles.header}>
        <TouchableOpacity style={eStyles.btn} onPress={goBack}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <View style={eStyles.headerActions}>
          <TouchableOpacity style={eStyles.btn} onPress={() => webRef.current?.injectJavaScript(`window.undo(); true;`)}>
            <Undo size={22} color={Colors.dark.text} />
          </TouchableOpacity>
          <TouchableOpacity style={eStyles.btn} onPress={() => webRef.current?.injectJavaScript(`window.redo(); true;`)}>
            <Redo size={22} color={Colors.dark.text} />
          </TouchableOpacity>
          <TouchableOpacity style={eStyles.btn} onPress={() => webRef.current?.injectJavaScript(`window.deleteSel(); true;`)}>
            <X size={22} color={Colors.dark.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[eStyles.btn, eStyles.previewBtn]} onPress={goPreview}>
            <Eye size={20} color={Colors.dark.background} />
            <Text style={eStyles.previewText}>Preview</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={eStyles.canvasWrap}>
        {loading && (
          <View style={eStyles.loading}>
            <ActivityIndicator size="large" color={Colors.dark.accent} />
            <Text style={eStyles.loadingText}>Loading canvas...</Text>
          </View>
        )}
        <WebView ref={webRef} source={{ html: html() }} style={eStyles.webview} onMessage={onMsg} javaScriptEnabled domStorageEnabled scrollEnabled={false} bounces={false} />
      </View>

      <View style={eStyles.indicator}>
        <Text style={eStyles.indicatorText}>Slide {curSlide} of {slides}</Text>
        <View style={eStyles.dots}>
          {Array.from({ length: slides }).map((_, i) => <View key={i} style={[eStyles.dot, curSlide === i + 1 && eStyles.dotActive]} />)}
        </View>
      </View>

      <View style={eStyles.toolbar}>
        {toolbar()}
        <View style={eStyles.tabs}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <TouchableOpacity key={t.id} style={[eStyles.tab, active && eStyles.tabActive]} onPress={() => setActiveTab(t.id)}>
                <Icon size={22} color={active ? Colors.dark.background : Colors.dark.text} />
                <Text style={[eStyles.tabLabel, active && eStyles.tabLabelActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Modal visible={showText} transparent animationType="slide" onRequestClose={() => setShowText(false)}>
        <View style={eStyles.modalOverlay}>
          <View style={eStyles.modalContent}>
            <View style={eStyles.modalHeader}>
              <Text style={eStyles.modalTitle}>Add Text</Text>
              <TouchableOpacity onPress={() => setShowText(false)}><X size={24} color={Colors.dark.text} /></TouchableOpacity>
            </View>
            <TextInput style={eStyles.input} placeholder="Enter text..." placeholderTextColor={Colors.dark.textMuted} value={textVal} onChangeText={setTextVal} multiline />
            <Text style={eStyles.label}>Font</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={eStyles.fontRow}>
                {FONTS.map((f) => (
                  <TouchableOpacity key={f.id} style={[eStyles.fontBtn, selFont.id === f.id && eStyles.fontActive]} onPress={() => setSelFont(f)}>
                    <Text style={[eStyles.fontName, selFont.id === f.id && eStyles.fontNameActive]}>{f.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity style={eStyles.addBtn} onPress={addText}>
              <Text style={eStyles.addBtnText}>Add to Canvas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const eStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.dark.surface, justifyContent: 'center', alignItems: 'center' },
  previewBtn: { flexDirection: 'row', width: 'auto', paddingHorizontal: 14, backgroundColor: Colors.dark.accent, gap: 6 },
  previewText: { fontSize: 14, fontWeight: '600', color: Colors.dark.background },
  canvasWrap: { flex: 1, backgroundColor: Colors.dark.surfaceElevated },
  webview: { flex: 1, backgroundColor: 'transparent' },
  loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Colors.dark.surfaceElevated, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.dark.textSecondary },
  indicator: { paddingVertical: 12, alignItems: 'center', backgroundColor: Colors.dark.background },
  indicatorText: { fontSize: 13, color: Colors.dark.textSecondary, marginBottom: 8 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.dark.border },
  dotActive: { backgroundColor: Colors.dark.accent, width: 20 },
  toolbar: { backgroundColor: Colors.dark.surface, borderTopWidth: 1, borderTopColor: Colors.dark.border },
  panel: { padding: 16, minHeight: 100 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.accent, paddingVertical: 14, borderRadius: 12, gap: 8 },
  actionText: { fontSize: 16, fontWeight: '600', color: Colors.dark.background },
  hint: { textAlign: 'center', fontSize: 13, color: Colors.dark.textMuted, marginTop: 12 },
  stickerRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 8 },
  stickerBtn: { width: 56, height: 56, backgroundColor: Colors.dark.background, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  stickerEmoji: { fontSize: 32 },
  colorRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 8 },
  colorBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  colorActive: { borderColor: Colors.dark.accent },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.dark.border, paddingVertical: 8, paddingHorizontal: 16 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10 },
  tabActive: { backgroundColor: Colors.dark.accent },
  tabLabel: { fontSize: 11, color: Colors.dark.textMuted, marginTop: 4 },
  tabLabelActive: { color: Colors.dark.background, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.dark.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '600', color: Colors.dark.text },
  input: { backgroundColor: Colors.dark.background, borderRadius: 12, padding: 16, fontSize: 16, color: Colors.dark.text, minHeight: 100, textAlignVertical: 'top', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.dark.textSecondary, marginBottom: 12 },
  fontRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  fontBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.dark.background, borderRadius: 8, borderWidth: 1, borderColor: Colors.dark.border },
  fontActive: { backgroundColor: Colors.dark.accent, borderColor: Colors.dark.accent },
  fontName: { fontSize: 14, color: Colors.dark.text },
  fontNameActive: { color: Colors.dark.background, fontWeight: '500' },
  addBtn: { backgroundColor: Colors.dark.accent, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  addBtnText: { fontSize: 16, fontWeight: '600', color: Colors.dark.background },
});
