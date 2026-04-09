// FILE_VERSION_1744065307
import { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, ScrollView, TextInput, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Undo, Redo, Image as ImageIcon, Type, Sticker, Palette, Eye, X, Check, Layers, LayoutGrid, Shapes } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { TEMPLATES, STICKERS, FONTS, CUTOUT_LETTERS, FRAMES, STICKER_CATEGORIES } from '@/constants/templates';
import { ICON_CATEGORIES } from '@/constants/icons';

const TABS = [
  { id: 'photos', icon: ImageIcon, label: 'Photos' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'stickers', icon: Sticker, label: 'Stickers' },
  { id: 'icons', icon: Shapes, label: 'Icons' },
  { id: 'elements', icon: LayoutGrid, label: 'Elements' },
  { id: 'background', icon: Palette, label: 'BG' },
  { id: 'layers', icon: Layers, label: 'Layers' },
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

type LayerItem = { id: string; type: string; visible: boolean; name: string };
type SelectedObject = { id: string; type: string; opacity: number; fill: string | null; shadow: number } | null;

export default function EditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const webRef = useRef<WebView>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('photos');
  const [slides, setSlides] = useState(parseInt(params.slides as string) || 3);
  const [ratio, setRatio] = useState<'square' | 'portrait' | 'story' | 'landscape'>((params.ratio as any) || 'portrait');
  const [canvasW, setCanvasW] = useState(3240);
  const [selColor, setSelColor] = useState('#F5F5F0');
  const [textVal, setTextVal] = useState('');
  const [selFont, setSelFont] = useState(FONTS[0]);
  const [fontSize, setFontSize] = useState(48);
  const [showText, setShowText] = useState(false);
  const [curSlide, setCurSlide] = useState(1);
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedObject, setSelectedObject] = useState<SelectedObject>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selStickerCat, setSelStickerCat] = useState('general');
  const [selIconCat, setSelIconCat] = useState('shapes');
  const [showColorPicker, setShowColorPicker] = useState<'fill' | 'stroke' | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportSecs, setExportSecs] = useState(0);
  const exportTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const dims = RATIOS[ratio];
    setCanvasW(dims.width * slides);
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

  // Mevcut projeyi yükle
  useEffect(() => {
    if (params.projectId) {
      (async () => {
        try {
          const stored = await AsyncStorage.getItem('carousel_projects');
          if (stored) {
            const projects = JSON.parse(stored);
            const project = projects.find((p: any) => p.id === params.projectId);
            if (project) {
              setSlides(project.slides);
              setRatio(project.ratio);
              if (project.canvasData) {
                // Canvas yüklendikten sonra JSON'u restore et
                const json = project.canvasData;
                setTimeout(() => {
                  webRef.current?.injectJavaScript(`c.loadFromJSON(${JSON.stringify(json)}, c.renderAll.bind(c)); true;`);
                }, 1500);
              }
            }
          }
        } catch (err) {
          console.error('Project load error:', err);
        }
      })();
    }
  }, [params.projectId]);

  const html = () => {
    const dims = RATIOS[ratio];
    const w = dims.width * slides;
    const h = dims.height;

    return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Georgia&family=Courier+New&family=Impact&family=Palatino&family=Trebuchet+MS&family=Verdana&family=Garamond&family=Baskerville&family=Playfair+Display&family=Oswald&family=Roboto&family=Montserrat&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #1a1a1a; overflow: hidden; width: 100vw; height: 100vh; }
#wrapper { width: 100vw; height: 100vh; overflow: hidden; position: relative; }
#container { position: absolute; top: 0; left: 0; transform-origin: top left; }
canvas { display: block; }
</style>
</head>
<body>
<div id="wrapper"><div id="container"><canvas id="c"></canvas></div></div>
<script>
const c = new fabric.Canvas('c', { width: ${w}, height: ${h}, backgroundColor: '${selColor}', preserveObjectStacking: true });
const cont = document.getElementById('container');
const scaleToFit = window.innerWidth / ${w};
let canvasScale = scaleToFit;
c.setZoom(scaleToFit);
c.setWidth(window.innerWidth);
c.setHeight(${h} * scaleToFit);
cont.style.transform = '';
function isLightColor(color) {
  let r, g, b;
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    const m = color.match(/\\d+/g);
    if (!m) return false;
    r = Number(m[0]); g = Number(m[1]); b = Number(m[2]);
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

function getContrastLineColor(bgColor) {
  return isLightColor(bgColor) ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)';
}

// Hayalet çizgiler: canvas üzerine Fabric.js Line nesneleri olarak çiz (export'ta gizlenecek)
const ghostLines = [];
const initialLineColor = getContrastLineColor('${selColor}');
for (let i = 1; i < ${slides}; i++) {
  const x = i * ${dims.width};
  const line = new fabric.Line([x, 0, x, ${h}], {
    stroke: initialLineColor,
    strokeWidth: 3,
    strokeDashArray: [20, 15],
    selectable: false,
    evented: false,
    excludeFromExport: true,
    id: '__ghost_line_' + i,
  });
  c.add(line);
  ghostLines.push(line);
}
const MOBILE_CONTROLS = { cornerColor: '#fff', cornerStrokeColor: '#333', borderColor: '#06FFB4', cornerSize: 20, transparentCorners: false, hasRotatingPoint: false };
let undoStack = [], redoStack = [];
function save() { undoStack.push(JSON.stringify(c)); redoStack = []; if (undoStack.length > 20) undoStack.shift(); }
window.hideGrid = () => { ghostLines.forEach(l => { l.set({ visible: false }); }); c.renderAll(); };
window.showGrid = () => { ghostLines.forEach(l => { l.set({ visible: true }); }); c.renderAll(); };
function sendLayersUpdate() {
  const layers = c.getObjects().filter(obj => !obj.id || !obj.id.startsWith('__ghost')).map(obj => ({
    id: obj.id,
    type: obj.type,
    visible: obj.visible !== false,
    name: obj.type === 'text' ? (obj.text || '').substring(0, 10) : obj.type
  }));
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'layersUpdate', layers }));
}
c.on('object:added', () => { save(); sendLayersUpdate(); });
c.on('object:removed', () => { save(); sendLayersUpdate(); });
c.on('object:modified', () => { save(); sendLayersUpdate(); });
function getVisibleCenterY() { return (c.getHeight() / 2) / c.getZoom(); }
window.addImg = (src, targetLeft) => { fabric.Image.fromURL(src, (img) => { const scale = Math.min(${dims.width} / img.width, ${h} / img.height); img.set({ id: Date.now().toString(), left: targetLeft || (${w / 2}), top: getVisibleCenterY(), scaleX: scale, scaleY: scale, ...MOBILE_CONTROLS }); c.add(img); c.setActiveObject(img); c.renderAll(); }); };
window.addTxt = (txt, opts) => { const t = new fabric.Text(txt, { id: Date.now().toString(), left: opts.left || ${w / 2}, top: getVisibleCenterY(), fontFamily: opts.fontFamily || 'Arial', fontSize: opts.fontSize || 48, fill: opts.color || '#fff', textAlign: 'center', originX: 'center', originY: 'center', ...MOBILE_CONTROLS }); c.add(t); c.setActiveObject(t); c.renderAll(); };
window.addSticker = (emoji, left) => { const t = new fabric.Text(emoji, { id: Date.now().toString(), left: left || ${w / 2}, top: getVisibleCenterY(), fontSize: 100, originX: 'center', originY: 'center', ...MOBILE_CONTROLS }); c.add(t); c.setActiveObject(t); c.renderAll(); };
window.setBg = (color) => { c.setBackgroundColor(color, () => { const lineColor = getContrastLineColor(color); ghostLines.forEach(l => l.set({ stroke: lineColor })); c.renderAll(); }); };
window.undo = () => { if (undoStack.length > 1) { redoStack.push(undoStack.pop()); const s = undoStack[undoStack.length - 1]; c.loadFromJSON(s, c.renderAll.bind(c)); } };
window.redo = () => { if (redoStack.length > 0) { const s = redoStack.pop(); undoStack.push(s); c.loadFromJSON(s, c.renderAll.bind(c)); } };
window.exportCanvas = () => { window.hideGrid(); setTimeout(() => { const data = c.toDataURL({ format: 'jpeg', quality: 0.92, multiplier: 1 }); const json = JSON.stringify(c.toJSON(['id'])); window.showGrid(); window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'export', data, canvasJson: json })); }, 50); };
window.exportPreview = () => { window.hideGrid(); setTimeout(() => { const data = c.toDataURL({ format: 'jpeg', quality: 0.75, multiplier: 1 }); const json = JSON.stringify(c.toJSON(['id'])); window.showGrid(); window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'export', data, canvasJson: json, isPreview: false })); }, 50); };
window.deleteSel = () => { const a = c.getActiveObject(); if (a) { c.remove(a); c.discardActiveObject(); c.renderAll(); } };
window.selectObject = (id) => { const obj = c.getObjects().find(o => o.id === id); if (!obj) return; c.setActiveObject(obj); c.renderAll(); };
window.bringForward = (id) => { const obj = c.getObjects().find(o => o.id === id); if (!obj) return; c.bringForward(obj); c.renderAll(); sendLayersUpdate(); };
window.sendBackward = (id) => { const obj = c.getObjects().find(o => o.id === id); if (!obj) return; c.sendBackwards(obj); c.renderAll(); sendLayersUpdate(); };
window.toggleVisibility = (id) => { const obj = c.getObjects().find(o => o.id === id); if (!obj) return; obj.set({ visible: !obj.visible }); c.renderAll(); sendLayersUpdate(); };
window.duplicateSel = () => { const a = c.getActiveObject(); if (!a) return; a.clone(cloned => { cloned.set({ left: a.left + 20, top: a.top + 20, id: Date.now().toString() }); c.add(cloned); c.setActiveObject(cloned); c.renderAll(); }); };
window.setOpacity = (v) => { const a = c.getActiveObject(); if (!a) return; a.set({ opacity: v }); c.renderAll(); };
window.setBlur = (v) => { const a = c.getActiveObject(); if (!a) return; a.set({ shadow: v > 0 ? new fabric.Shadow({ blur: v, color: 'rgba(0,0,0,0.5)' }) : null }); c.renderAll(); };
window.setStroke = (color, width) => { const a = c.getActiveObject(); if (!a) return; a.set({ stroke: color, strokeWidth: width }); c.renderAll(); };
window.setFill = (color) => { const a = c.getActiveObject(); if (!a) return; a.set({ fill: color }); c.renderAll(); };
window.moveToSlide = (slideIndex, slideWidth) => { const a = c.getActiveObject(); if (!a) return; a.set({ left: (slideIndex - 1) * slideWidth + slideWidth / 2 }); a.setCoords(); c.renderAll(); };
window.addFrame = (svgStr, w, h) => { fabric.loadSVGFromString(svgStr, (objects, options) => { const svg = fabric.util.groupSVGElements(objects, options); svg.set({ left: 0, top: 0, scaleX: w / svg.width, scaleY: h / svg.height, id: Date.now().toString(), selectable: true, ...MOBILE_CONTROLS }); c.add(svg); c.renderAll(); }); };
window.addFrameImg = (src, w, h) => { fabric.Image.fromURL(src, (img) => { img.set({ left: 0, top: 0, scaleX: w / img.width, scaleY: h / img.height, id: Date.now().toString(), selectable: true, ...MOBILE_CONTROLS }); c.add(img); c.renderAll(); }); };
c.on('selection:created', (e) => {
  const obj = e.selected[0];
  if (!obj) return;
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'objectSelected',
    objectId: obj.id,
    objectType: obj.type,
    properties: { opacity: obj.opacity || 1, fill: obj.fill || null, shadow: (obj.shadow && obj.shadow.blur) || 0 }
  }));
});
c.on('selection:updated', (e) => {
  const obj = e.selected[0];
  if (!obj) return;
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'objectSelected',
    objectId: obj.id,
    objectType: obj.type,
    properties: { opacity: obj.opacity || 1, fill: obj.fill || null, shadow: (obj.shadow && obj.shadow.blur) || 0 }
  }));
});
c.on('selection:cleared', () => {
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'objectDeselected' }));
});
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
      else if (m.type === 'export') onExport(m.data, m.canvasJson, m.isPreview);
      else if (m.type === 'slideChange') {
        setCurSlide(prev => Math.max(1, Math.min(slides, prev + m.dir)));
      }
      else if (m.type === 'layersUpdate') {
        setLayers(m.layers);
      }
      else if (m.type === 'objectSelected') {
        setSelectedObjectId(m.objectId);
        setSelectedObject({ id: m.objectId, type: m.objectType, ...m.properties });
      }
      else if (m.type === 'objectDeselected') {
        setSelectedObjectId(null);
        setSelectedObject(null);
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
          { compress: 1, format: ImageManipulator.SaveFormat.PNG, base64: true }
        );
        const dataUri = `data:image/png;base64,${manipResult.base64}`;
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

  const addFrameToCanvas = async (f: import('@/constants/templates').Frame, w: number, h: number) => {
    if (f.imageAsset === 'local_124') {
      // 124.jpg'yi base64'e çevir ve canvas'a ekle
      try {
        const { Image: RNImage } = require('react-native');
        const source = require('@/assets/124.jpg');
        const resolved = RNImage.resolveAssetSource(source);
        const uri = resolved.uri;
        const manipResult = await ImageManipulator.manipulateAsync(
          uri,
          [],
          { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        const dataUri = `data:image/jpeg;base64,${manipResult.base64}`;
        webRef.current?.injectJavaScript(`window.addFrameImg('${dataUri}', ${w}, ${h}); true;`);
      } catch (err) {
        console.error('Frame image load error:', err);
      }
    } else if (f.svg) {
      webRef.current?.injectJavaScript(`window.addFrame(${JSON.stringify(f.svg)}, ${w}, ${h}); true;`);
    }
  };

  const setBg = (color: string) => {
    setSelColor(color);
    webRef.current?.injectJavaScript(`window.setBg('${color}'); true;`);
  };

  const onExport = (data: string, canvasJson?: string, isPreview?: boolean) => {
    if (exportTimerRef.current) { clearInterval(exportTimerRef.current); exportTimerRef.current = null; }
    setExporting(false);
    webRef.current?.injectJavaScript(`window.showGrid(); true;`);
    router.push({
      pathname: '/preview',
      params: {
        imageData: data,
        slides: slides.toString(),
        ratio,
        width: canvasW.toString(),
        height: (RATIOS[ratio].height).toString(),
        projectId: (params.projectId as string) || '',
        canvasData: canvasJson || '',
        isPreview: isPreview ? '1' : '0',
      }
    });
  };

  const goPreview = () => {
    setExporting(true);
    setExportSecs(0);
    exportTimerRef.current = setInterval(() => {
      setExportSecs(s => s + 1);
    }, 1000);
    // Preview için düşük çözünürlük (0.25x) — çok daha hızlı
    webRef.current?.injectJavaScript(`window.hideGrid(); window.exportPreview(); true;`);
  };

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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {STICKER_CATEGORIES.map(cat => (
                <TouchableOpacity key={cat.id}
                  style={[eStyles.catBtn, selStickerCat === cat.id && eStyles.catBtnActive]}
                  onPress={() => setSelStickerCat(cat.id)}>
                  <Text style={[eStyles.catLabel, selStickerCat === cat.id && { color: Colors.dark.background }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={eStyles.stickerRow}>
              {(STICKER_CATEGORIES.find(c => c.id === selStickerCat)?.stickers || []).map((s) => (
                <TouchableOpacity key={s.id} style={eStyles.stickerBtn} onPress={() => addSticker(s.emoji)}>
                  <Text style={eStyles.stickerEmoji}>{s.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      );
      case 'icons': return (
        <View style={eStyles.panel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {ICON_CATEGORIES.map(cat => (
                <TouchableOpacity key={cat.id}
                  style={[eStyles.catBtn, selIconCat === cat.id && eStyles.catBtnActive]}
                  onPress={() => setSelIconCat(cat.id)}>
                  <Text style={[eStyles.catLabel, selIconCat === cat.id && { color: Colors.dark.background }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 120 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 4 }}>
              {(ICON_CATEGORIES.find(c => c.id === selIconCat)?.icons || []).map(icon => {
                const slideW = RATIOS[ratio].width;
                const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${icon.path}"/></svg>`;
                const dims = RATIOS[ratio];
                return (
                  <TouchableOpacity key={icon.id} style={eStyles.iconBtn}
                    onPress={() => webRef.current?.injectJavaScript(`window.addFrame(${JSON.stringify(svgStr)}, 200, 200); true;`)}>
                    <Text style={eStyles.iconLabel}>{icon.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      );
      case 'elements': return (
        <View style={eStyles.panel}>
          <Text style={eStyles.label}>Cutout Letters</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={eStyles.stickerRow}>
              {CUTOUT_LETTERS.map((l) => (
                <TouchableOpacity key={l.id} style={eStyles.stickerBtn} onPress={() => addSticker(l.emoji)}>
                  <Text style={eStyles.stickerEmoji}>{l.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text style={[eStyles.label, { marginTop: 12 }]}>Frames</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 8 }}>
              {FRAMES.map((f) => {
                const dims = RATIOS[ratio];
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={[eStyles.frameBtn, { borderColor: f.color }]}
                    onPress={() => addFrameToCanvas(f, dims.width, dims.height)}
                  >
                    <View style={[eStyles.framePlatformDot, { backgroundColor: f.color }]} />
                    <Text style={eStyles.frameName}>{f.name}</Text>
                    <Text style={eStyles.frameRatio}>{f.ratio}</Text>
                  </TouchableOpacity>
                );
              })}
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
      case 'layers': return (
        <ScrollView style={{ maxHeight: 160 }}>
          {layers.length === 0 ? (
            <Text style={eStyles.hint}>Canvas boş</Text>
          ) : (
            layers.slice().reverse().map((layer) => (
              <View key={layer.id} style={eStyles.layerRow}>
                <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  onPress={() => webRef.current?.injectJavaScript(`window.selectObject('${layer.id}'); true;`)}>
                  <Text style={eStyles.layerIcon}>{layer.type === 'text' ? 'T' : layer.type === 'image' ? '🖼' : '◻'}</Text>
                  <Text style={[eStyles.layerName, selectedObjectId === layer.id && { color: Colors.dark.accent }]} numberOfLines={1}>{layer.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => webRef.current?.injectJavaScript(`window.bringForward('${layer.id}'); true;`)}>
                  <Text style={eStyles.layerBtn}>↑</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => webRef.current?.injectJavaScript(`window.sendBackward('${layer.id}'); true;`)}>
                  <Text style={eStyles.layerBtn}>↓</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => webRef.current?.injectJavaScript(`window.toggleVisibility('${layer.id}'); true;`)}>
                  <Text style={eStyles.layerBtn}>{layer.visible ? '👁' : '🚫'}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
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

      {layers.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={eStyles.elementTray} contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
          {layers.map((layer) => (
            <TouchableOpacity key={layer.id}
              style={[eStyles.trayItem, selectedObjectId === layer.id && eStyles.trayItemActive]}
              onPress={() => webRef.current?.injectJavaScript(`window.selectObject('${layer.id}'); true;`)}>
              <Text style={{ fontSize: 20 }}>{layer.type === 'text' ? 'T' : layer.type === 'image' ? '🖼' : '◻'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {selectedObject && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={eStyles.objectToolbar} contentContainerStyle={{ gap: 4, paddingHorizontal: 12, paddingVertical: 8 }}>
          <TouchableOpacity style={eStyles.toolBtn} onPress={() => webRef.current?.injectJavaScript(`window.deleteSel(); true;`)}>
            <Text style={eStyles.toolIcon}>🗑</Text>
            <Text style={eStyles.toolLabel}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={eStyles.toolBtn} onPress={() => webRef.current?.injectJavaScript(`window.duplicateSel(); true;`)}>
            <Text style={eStyles.toolIcon}>⧉</Text>
            <Text style={eStyles.toolLabel}>Duplicate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={eStyles.toolBtn} onPress={() => webRef.current?.injectJavaScript(`window.bringForward('${selectedObject.id}'); true;`)}>
            <Text style={eStyles.toolIcon}>↑</Text>
            <Text style={eStyles.toolLabel}>Forward</Text>
          </TouchableOpacity>
          <TouchableOpacity style={eStyles.toolBtn} onPress={() => webRef.current?.injectJavaScript(`window.sendBackward('${selectedObject.id}'); true;`)}>
            <Text style={eStyles.toolIcon}>↓</Text>
            <Text style={eStyles.toolLabel}>Backward</Text>
          </TouchableOpacity>
          {/* Opacity: 5 seviye */}
          {[1, 0.75, 0.5, 0.25].map(v => (
            <TouchableOpacity key={v} style={eStyles.toolBtn}
              onPress={() => webRef.current?.injectJavaScript(`window.setOpacity(${v}); true;`)}>
              <Text style={[eStyles.toolIcon, { opacity: v }]}>◎</Text>
              <Text style={eStyles.toolLabel}>{Math.round(v * 100)}%</Text>
            </TouchableOpacity>
          ))}
          {/* Blur: 3 seviye */}
          {[0, 10, 25].map(v => (
            <TouchableOpacity key={`blur-${v}`} style={eStyles.toolBtn}
              onPress={() => webRef.current?.injectJavaScript(`window.setBlur(${v}); true;`)}>
              <Text style={eStyles.toolIcon}>≋</Text>
              <Text style={eStyles.toolLabel}>Blur {v}</Text>
            </TouchableOpacity>
          ))}
          {/* Fill renk butonu */}
          <TouchableOpacity style={eStyles.toolBtn} onPress={() => setShowColorPicker('fill')}>
            <View style={[eStyles.colorPreview, { backgroundColor: selectedObject.fill || '#000' }]} />
            <Text style={eStyles.toolLabel}>Fill</Text>
          </TouchableOpacity>
          {/* Stroke renk butonu */}
          <TouchableOpacity style={eStyles.toolBtn} onPress={() => setShowColorPicker('stroke')}>
            <View style={[eStyles.colorPreview, { backgroundColor: 'transparent', borderWidth: 3, borderColor: '#fff' }]} />
            <Text style={eStyles.toolLabel}>Stroke</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

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

      {/* Renk Seçici Modal */}
      <Modal visible={showColorPicker !== null} transparent animationType="slide" onRequestClose={() => setShowColorPicker(null)}>
        <View style={eStyles.modalOverlay}>
          <View style={eStyles.modalContent}>
            <View style={eStyles.modalHeader}>
              <Text style={eStyles.modalTitle}>{showColorPicker === 'fill' ? 'Fill Color' : 'Stroke Color'}</Text>
              <TouchableOpacity onPress={() => setShowColorPicker(null)}><X size={24} color={Colors.dark.text} /></TouchableOpacity>
            </View>
            {/* Tam renk paleti */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {[
                '#FFFFFF', '#F5F5F0', '#E8E8E8', '#D0D0D0', '#A0A0A0', '#606060', '#2A2A2A', '#000000',
                '#FF006E', '#FF4444', '#FF7700', '#FFBE0B', '#FFE4E1',
                '#06FFB4', '#3A86FF', '#8338EC', '#9B59B6', '#98FB98',
                '#E6E6FA', '#FFD6E0', '#F4E4C1', '#1A0A2E', '#1C1C1E',
                '#FB5607', '#E8D5C4', '#FFD700', '#00CED1',
                '#FF69B4', '#7B68EE', '#20B2AA', '#FF8C00', '#DC143C',
              ].map((c, idx) => (
                <TouchableOpacity
                  key={`${c}-${idx}`}
                  style={[eStyles.colorPickerBtn, { backgroundColor: c }]}
                  onPress={() => {
                    if (showColorPicker === 'fill') {
                      webRef.current?.injectJavaScript(`window.setFill('${c}'); true;`);
                      setSelectedObject(prev => prev ? { ...prev, fill: c } : null);
                    } else {
                      webRef.current?.injectJavaScript(`window.setStroke('${c}', 4); true;`);
                    }
                    setShowColorPicker(null);
                  }}
                />
              ))}
            </View>
            {/* Şeffaf / renk kaldır */}
            <TouchableOpacity
              style={[eStyles.actionBtn, { marginTop: 16 }]}
              onPress={() => {
                if (showColorPicker === 'fill') {
                  webRef.current?.injectJavaScript(`window.setFill('transparent'); true;`);
                } else {
                  webRef.current?.injectJavaScript(`window.setStroke('', 0); true;`);
                }
                setShowColorPicker(null);
              }}>
              <Text style={eStyles.actionText}>Remove {showColorPicker === 'fill' ? 'Fill' : 'Stroke'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  layerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  layerIcon: { fontSize: 16, width: 24, textAlign: 'center', color: Colors.dark.textSecondary },
  layerName: { fontSize: 13, color: Colors.dark.text, flex: 1 },
  layerBtn: { fontSize: 18, paddingHorizontal: 8, color: Colors.dark.textSecondary },
  elementTray: { backgroundColor: Colors.dark.background, borderTopWidth: 1, borderTopColor: Colors.dark.border, maxHeight: 60 },
  trayItem: { width: 44, height: 44, borderRadius: 8, backgroundColor: Colors.dark.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  trayItemActive: { borderColor: Colors.dark.accent },
  objectToolbar: { backgroundColor: Colors.dark.surfaceElevated, borderTopWidth: 1, borderTopColor: Colors.dark.border, maxHeight: 80 },
  toolBtn: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, minWidth: 52 },
  toolIcon: { fontSize: 20 },
  toolLabel: { fontSize: 10, color: Colors.dark.textMuted, marginTop: 2 },
  toolColorBtn: { width: 32, height: 32, borderRadius: 16, marginTop: 6 },
  colorPreview: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: Colors.dark.border },
  colorPickerBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: Colors.dark.border },
  frameBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.dark.surface, borderRadius: 8, borderWidth: 2, borderColor: Colors.dark.border, justifyContent: 'center', alignItems: 'center', minWidth: 110 },
  frameName: { fontSize: 12, color: Colors.dark.text, textAlign: 'center', fontWeight: '600', marginTop: 4 },
  frameRatio: { fontSize: 10, color: Colors.dark.textMuted, textAlign: 'center', marginTop: 2, textTransform: 'capitalize' },
  framePlatformDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  catBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.dark.surface, borderRadius: 8, borderWidth: 1, borderColor: Colors.dark.border },
  catBtnActive: { backgroundColor: Colors.dark.accent, borderColor: Colors.dark.accent },
  catLabel: { fontSize: 12, color: Colors.dark.text, fontWeight: '500' },
  iconBtn: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: Colors.dark.surface, borderRadius: 8, borderWidth: 1, borderColor: Colors.dark.border, minWidth: 60, alignItems: 'center' },
  iconLabel: { fontSize: 10, color: Colors.dark.text, textAlign: 'center' },
});
