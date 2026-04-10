import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';

const UNIQUE_PREVIEW_MARKER = 'carousel_studio_preview_001';
const { width: SCREEN_W } = Dimensions.get('window');

const RATIOS = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
};

// Basit SVG-free circular progress — sadece Animated ile
function CircularProgress({ secs }: { secs: number }) {
  const SIZE = 80;
  const STROKE = 6;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  // max 10 saniye göster, sonra dolu kalır
  const progress = Math.min(secs / 10, 1);
  const dashOffset = CIRC * (1 - progress);

  return (
    <View style={{ width: SIZE, height: SIZE, justifyContent: 'center', alignItems: 'center' }}>
      {/* Track */}
      <View style={{
        position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2,
        borderWidth: STROKE, borderColor: Colors.dark.border,
      }} />
      {/* Progress arc — border trick ile yaklaşık gösterim */}
      <View style={{
        position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2,
        borderWidth: STROKE,
        borderTopColor: Colors.dark.accent,
        borderRightColor: progress > 0.25 ? Colors.dark.accent : Colors.dark.border,
        borderBottomColor: progress > 0.5 ? Colors.dark.accent : Colors.dark.border,
        borderLeftColor: progress > 0.75 ? Colors.dark.accent : Colors.dark.border,
        transform: [{ rotate: '-90deg' }],
      }} />
      <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.dark.accent }}>{secs}s</Text>
    </View>
  );
}

export default function CarouselStudioPreview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const [navSecs, setNavSecs] = useState(0);
  const navTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const imageData = params.imageData as string;
  const slides = parseInt(params.slides as string) || 3;
  const ratio = (params.ratio as string) || 'portrait';
  const projectId = (params.projectId as string) || '';
  const canvasData = (params.canvasData as string) || '';

  const dims = RATIOS[ratio as keyof typeof RATIOS] || RATIOS.portrait;

  const goToExport = useCallback(async () => {
    if (navigating) return;
    setNavigating(true);
    setNavSecs(0);

    // Saniye sayacı başlat
    navTimerRef.current = setInterval(() => {
      setNavSecs(s => s + 1);
    }, 1000);

    try {
      // imageData büyük base64 olduğu için AsyncStorage üzerinden geçir
      await AsyncStorage.setItem('__preview_imageData', imageData);
    } catch (_) {}

    // Kısa bir tick — UI'ın overlay'i render etmesine izin ver
    setTimeout(() => {
      if (navTimerRef.current) { clearInterval(navTimerRef.current); navTimerRef.current = null; }
      router.push({
        pathname: '/export',
        params: {
          imageDataKey: '__preview_imageData',
          slides: slides.toString(),
          ratio,
          projectId,
          canvasData,
        },
      });
      setNavigating(false);
    }, 80);
  }, [router, imageData, slides, ratio, projectId, canvasData, navigating]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Preview</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.previewContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const slide = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_W - 40));
            setCurrentSlide(slide);
          }}
        >
          {Array.from({ length: slides }).map((_, i) => (
            <View key={i} style={styles.slideWrapper}>
              <View style={[styles.slide, { width: SCREEN_W - 40, aspectRatio: dims.width / dims.height }]}>
                <Image
                  source={{ uri: imageData }}
                  style={[styles.slideImage, { marginLeft: -(i * (SCREEN_W - 40)) }]}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.slideNumber}>{i + 1} / {slides}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Swipe to preview all slides</Text>
        <Text style={styles.infoSub}>Each slide will be saved as a separate image</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.thumbStrip}
        contentContainerStyle={styles.thumbStripContent}
      >
        {Array.from({ length: slides }).map((_, i) => {
          const thumbW = Math.min(80, (SCREEN_W - 40) / Math.min(slides, 5));
          const thumbH = thumbW * (dims.height / dims.width);
          return (
            <TouchableOpacity
              key={i}
              onPress={() => {
                scrollRef.current?.scrollTo({ x: i * SCREEN_W, animated: true });
                setCurrentSlide(i);
              }}
              style={[styles.thumbWrapper, currentSlide === i && styles.thumbWrapperActive]}
            >
              <View style={[styles.thumb, { width: thumbW, height: thumbH }]}>
                <Image
                  source={{ uri: imageData }}
                  style={{ width: thumbW * slides, height: thumbH, marginLeft: -(i * thumbW) }}
                  resizeMode="cover"
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.dots}>
        {Array.from({ length: slides }).map((_, i) => (
          <View key={i} style={[styles.dot, currentSlide === i && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={goBack} disabled={navigating}>
          <X size={20} color={Colors.dark.text} />
          <Text style={styles.editText}>Edit More</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.exportBtn, navigating && styles.exportBtnDisabled]}
          onPress={goToExport}
          disabled={navigating}
        >
          <Check size={20} color={Colors.dark.background} />
          <Text style={styles.exportText}>Looks Good</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Overlay */}
      {navigating && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <CircularProgress secs={navSecs} />
            <Text style={styles.overlayTitle}>Hazırlanıyor...</Text>
            <Text style={styles.overlaySub}>Export ekranına yönlendiriliyorsunuz</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.dark.surface, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '600', color: Colors.dark.text },
  placeholder: { width: 40 },
  previewContainer: { flex: 1, justifyContent: 'center' },
  slideWrapper: { width: SCREEN_W, alignItems: 'center', paddingHorizontal: 20 },
  slide: { borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.dark.surface },
  slideImage: { width: '300%', height: '100%' },
  slideNumber: { marginTop: 16, fontSize: 14, color: Colors.dark.textSecondary },
  info: { paddingHorizontal: 40, paddingVertical: 20, alignItems: 'center' },
  infoTitle: { fontSize: 16, fontWeight: '600', color: Colors.dark.text },
  infoSub: { fontSize: 14, color: Colors.dark.textMuted, marginTop: 4, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.dark.border },
  dotActive: { backgroundColor: Colors.dark.accent, width: 24 },
  thumbStrip: { paddingHorizontal: 20, marginBottom: 8 },
  thumbStripContent: { gap: 8, paddingVertical: 4 },
  thumbWrapper: { borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  thumbWrapperActive: { borderColor: Colors.dark.accent },
  thumb: { borderRadius: 6, overflow: 'hidden', backgroundColor: Colors.dark.surface },
  actions: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.surface, paddingVertical: 16, borderRadius: 12, gap: 8 },
  editText: { fontSize: 16, fontWeight: '600', color: Colors.dark.text },
  exportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.accent, paddingVertical: 16, borderRadius: 12, gap: 8 },
  exportBtnDisabled: { opacity: 0.5 },
  exportText: { fontSize: 16, fontWeight: '600', color: Colors.dark.background },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  overlayCard: { backgroundColor: Colors.dark.surface, borderRadius: 24, padding: 36, alignItems: 'center', width: 260, gap: 16 },
  overlayTitle: { fontSize: 17, fontWeight: '700', color: Colors.dark.text },
  overlaySub: { fontSize: 13, color: Colors.dark.textMuted, textAlign: 'center', lineHeight: 18 },
});
