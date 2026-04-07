import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

const UNIQUE_PREVIEW_MARKER = 'carousel_studio_preview_001';
const { width: SCREEN_W } = Dimensions.get('window');

const RATIOS = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
};

export default function CarouselStudioPreview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentSlide, setCurrentSlide] = useState(0);

  const imageData = params.imageData as string;
  const slides = parseInt(params.slides as string) || 3;
  const ratio = (params.ratio as string) || 'portrait';

  const dims = RATIOS[ratio as keyof typeof RATIOS] || RATIOS.portrait;

  const goToExport = useCallback(() => {
    router.push({
      pathname: '/export',
      params: {
        imageData,
        slides: slides.toString(),
        ratio,
      },
    });
  }, [router, imageData, slides, ratio]);

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

      <View style={styles.dots}>
        {Array.from({ length: slides }).map((_, i) => (
          <View key={i} style={[styles.dot, currentSlide === i && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={goBack}>
          <X size={20} color={Colors.dark.text} />
          <Text style={styles.editText}>Edit More</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportBtn} onPress={goToExport}>
          <Check size={20} color={Colors.dark.background} />
          <Text style={styles.exportText}>Looks Good</Text>
        </TouchableOpacity>
      </View>
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
  actions: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.surface, paddingVertical: 16, borderRadius: 12, gap: 8 },
  editText: { fontSize: 16, fontWeight: '600', color: Colors.dark.text },
  exportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.accent, paddingVertical: 16, borderRadius: 12, gap: 8 },
  exportText: { fontSize: 16, fontWeight: '600', color: Colors.dark.background },
});
