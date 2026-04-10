import { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert, Linking, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Download, Instagram, Check, ArrowLeft, Save } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import type { Project } from '@/types/project';

const UNIQUE_EXPORT_MARKER = 'carousel_studio_export_001';

const RATIOS = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
};

export default function CarouselStudioExport() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [exporting, setExporting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [showNameModal, setShowNameModal] = useState(false);
  const [projectName, setProjectName] = useState('My Carousel');
  const [exportStep, setExportStep] = useState('');
  const [exportProgress, setExportProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const [imageData, setImageData] = useState<string>((params.imageData as string) || '');
  const slides = parseInt(params.slides as string) || 3;
  const ratio = (params.ratio as string) || 'portrait';
  const canvasData = params.canvasData as string | undefined;
  const projectId = params.projectId as string | undefined;
  // isPreview=1 ise imageData düşük çözünürlüklü — sadece önizleme için
  const isPreview = params.isPreview === '1';

  // imageDataKey varsa AsyncStorage'dan oku (büyük base64 URL param yerine)
  useEffect(() => {
    const key = params.imageDataKey as string | undefined;
    if (key) {
      AsyncStorage.getItem(key).then(val => {
        if (val) setImageData(val);
      });
    }
  }, [params.imageDataKey]);

  const dims = RATIOS[ratio as keyof typeof RATIOS] || RATIOS.portrait;

  const saveProjectToApp = useCallback(async (thumbnail: string, name: string) => {
    try {
      const stored = await AsyncStorage.getItem('carousel_projects');
      const projects: Project[] = stored ? JSON.parse(stored) : [];
      const now = Date.now();

      if (projectId) {
        const idx = projects.findIndex(p => p.id === projectId);
        if (idx >= 0) {
          projects[idx] = { ...projects[idx], name, thumbnail, canvasData, updatedAt: now };
        }
      } else {
        const newProject: Project = {
          id: now.toString(),
          name,
          slides,
          ratio: ratio as Project['ratio'],
          createdAt: now,
          updatedAt: now,
          thumbnail,
          canvasData,
        };
        projects.unshift(newProject);
      }

      await AsyncStorage.setItem('carousel_projects', JSON.stringify(projects));
    } catch (err) {
      console.error('Project save error:', err);
    }
  }, [projectId, slides, ratio, canvasData]);

  // UI'ın render etmesine fırsat vermek için her adım arasında küçük bir tick
  const tick = () => new Promise<void>(resolve => setTimeout(resolve, 16));

  const exportImages = useCallback(async (name: string) => {
    setExporting(true);
    setExportProgress(0);
    setExportStep('İzin alınıyor...');
    setShowNameModal(false);
    await tick();

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save photos to your gallery.');
        setExporting(false);
        return;
      }

      setExportStep('Görsel hazırlanıyor...');
      setExportProgress(10);
      await tick();

      // Boyutu ImageManipulator olmadan hesapla — imageData base64 URI'dan
      // Canvas'tan gelen görüntü slides * slideW genişliğinde
      // Gerçek boyutu bulmak için küçük bir manipülasyon yapıyoruz
      const sizeResult = await ImageManipulator.manipulateAsync(imageData, [], { compress: 1 });
      const imageWidth = sizeResult.width;
      const imageHeight = sizeResult.height;
      const cropW = Math.floor(imageWidth / slides);

      setExportStep('Thumbnail oluşturuluyor...');
      setExportProgress(20);
      await tick();

      // Thumbnail — küçük, hızlı
      const thumbResult = await ImageManipulator.manipulateAsync(
        imageData,
        [{ crop: { originX: 0, originY: 0, width: cropW, height: imageHeight } }, { resize: { width: 300 } }],
        { format: ImageManipulator.SaveFormat.JPEG, compress: 0.6, base64: true }
      );
      const thumbnail = `data:image/jpeg;base64,${thumbResult.base64}`;

      setExportStep('Proje kaydediliyor...');
      setExportProgress(25);
      await tick();
      await saveProjectToApp(thumbnail, name);

      // Tüm slide'ları önce crop et (paralel)
      setExportStep('Slide\'lar kesiliyor...');
      setExportProgress(30);
      await tick();

      const cropPromises = Array.from({ length: slides }, (_, i) =>
        ImageManipulator.manipulateAsync(
          imageData,
          [{ crop: { originX: i * cropW, originY: 0, width: cropW, height: imageHeight } }],
          { format: ImageManipulator.SaveFormat.JPEG, compress: 0.95 }
        )
      );
      const cropResults = await Promise.all(cropPromises);

      setExportProgress(75);
      setExportStep('Galeriye kaydediliyor...');
      await tick();

      // Galeriye sırayla kaydet (MediaLibrary paralel desteklemez)
      const assets: MediaLibrary.Asset[] = [];
      for (let i = 0; i < cropResults.length; i++) {
        const stepProgress = 75 + Math.round(((i + 1) / slides) * 25);
        setExportProgress(stepProgress);
        setExportStep(`Slide ${i + 1} / ${slides} kaydediliyor...`);
        const asset = await MediaLibrary.createAssetAsync(cropResults[i].uri);
        assets.push(asset);
      }

      setExportProgress(100);
      setExportStep('Tamamlandı!');
      await tick();
      setSavedCount(assets.length);
      setCompleted(true);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Something went wrong while saving your images.');
    } finally {
      setExporting(false);
    }
  }, [imageData, slides, saveProjectToApp]);

  const openInstagram = useCallback(async () => {
    const url = 'instagram://camera';
    const webUrl = 'https://instagram.com';
    try {
      const canOpen = await Linking.canOpenURL(url);
      await Linking.openURL(canOpen ? url : webUrl);
    } catch {
      await Linking.openURL(webUrl);
    }
  }, []);

  const goHome = useCallback(() => {
    router.push('/');
  }, [router]);

  if (completed) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Check size={48} color={Colors.dark.background} />
          </View>
          <Text style={styles.successTitle}>Kaydedildi!</Text>
          <Text style={styles.successSub}>{savedCount} fotoğraf galerine kaydedildi</Text>

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Sonraki Adımlar:</Text>
            <Text style={styles.instructionsText}>
              1. Instagram'ı aç{'\n'}
              2. Yeni Gönderi'ye bas{'\n'}
              3. Birden Fazla Seç{'\n'}
              4. Kaydedilen fotoğrafları sırayla seç
            </Text>
          </View>

          <TouchableOpacity style={styles.igButton} onPress={openInstagram}>
            <Instagram size={24} color={Colors.dark.background} />
            <Text style={styles.igButtonText}>Instagram'ı Aç</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeButton} onPress={goHome}>
            <Text style={styles.homeButtonText}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Export</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.preview}>
        <Image source={{ uri: imageData }} style={styles.previewImage} resizeMode="contain" />
        {isPreview && (
          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>Önizleme</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Kaydetmeye Hazır</Text>
        <Text style={styles.infoSub}>{slides} slide olarak bölünecek ({dims.width}×{dims.height}px)</Text>
      </View>

      {exporting ? (
        <View style={styles.exporting}>
          <Text style={styles.exportingStep}>{exportStep}</Text>
          <View style={styles.progressBarWrap}>
            <View style={[styles.progressFill, { width: `${exportProgress}%` as any }]} />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>{exportProgress}%</Text>
            <Text style={styles.progressSlideLabel}>
              {exportProgress < 20 ? 'Hazırlanıyor...' : exportProgress === 100 ? '✓ Tamamlandı' : `Slide işleniyor`}
            </Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.exportBtn} onPress={() => setShowNameModal(true)}>
          <Download size={24} color={Colors.dark.background} />
          <Text style={styles.exportBtnText}>Galeriye Kaydet</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showNameModal} transparent animationType="slide" onRequestClose={() => setShowNameModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Proje Adı</Text>
            <TextInput
              style={styles.nameInput}
              value={projectName}
              onChangeText={setProjectName}
              placeholder="My Carousel"
              placeholderTextColor={Colors.dark.textMuted}
              autoFocus
            />
            <TouchableOpacity style={styles.exportBtn} onPress={() => exportImages(projectName || 'My Carousel')}>
              <Save size={20} color={Colors.dark.background} />
              <Text style={styles.exportBtnText}>Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowNameModal(false)}>
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 18, fontWeight: '600', color: Colors.dark.text },
  preview: { flex: 1, padding: 20, justifyContent: 'center', position: 'relative' },
  previewImage: { width: '100%', height: '100%', borderRadius: 12 },
  previewBadge: { position: 'absolute', top: 28, right: 28, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  previewBadgeText: { fontSize: 12, color: Colors.dark.textSecondary },
  info: { paddingHorizontal: 20, paddingBottom: 20, alignItems: 'center' },
  infoTitle: { fontSize: 18, fontWeight: '600', color: Colors.dark.text },
  infoSub: { fontSize: 14, color: Colors.dark.textMuted, marginTop: 4, textAlign: 'center' },
  exporting: { paddingHorizontal: 24, paddingVertical: 28, alignItems: 'center' },
  exportingStep: { fontSize: 15, fontWeight: '600', color: Colors.dark.text, marginBottom: 16, textAlign: 'center' },
  exportingText: { marginTop: 16, fontSize: 15, color: Colors.dark.textSecondary, textAlign: 'center' },
  progressBarWrap: { width: '100%', height: 10, backgroundColor: Colors.dark.border, borderRadius: 5, overflow: 'hidden' },
  progressBar: { width: '80%', height: 6, backgroundColor: Colors.dark.border, borderRadius: 3, marginTop: 16, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.dark.accent, borderRadius: 5 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8 },
  progressLabel: { fontSize: 13, fontWeight: '700', color: Colors.dark.accent },
  progressSlideLabel: { fontSize: 13, color: Colors.dark.textMuted },
  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.accent, marginHorizontal: 20, marginBottom: 32, paddingVertical: 18, borderRadius: 16, gap: 12 },
  exportBtnText: { fontSize: 18, fontWeight: '600', color: Colors.dark.background },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.dark.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: Colors.dark.text, marginBottom: 16 },
  nameInput: { backgroundColor: Colors.dark.background, borderRadius: 12, padding: 16, fontSize: 16, color: Colors.dark.text, marginBottom: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  cancelText: { fontSize: 16, color: Colors.dark.textSecondary },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.dark.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: '700', color: Colors.dark.text },
  successSub: { fontSize: 16, color: Colors.dark.textSecondary, marginTop: 8 },
  instructions: { backgroundColor: Colors.dark.surface, borderRadius: 16, padding: 24, width: '100%', marginTop: 32 },
  instructionsTitle: { fontSize: 16, fontWeight: '600', color: Colors.dark.text, marginBottom: 12 },
  instructionsText: { fontSize: 14, color: Colors.dark.textSecondary, lineHeight: 24 },
  igButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.accent, width: '100%', marginTop: 32, paddingVertical: 16, borderRadius: 12, gap: 10 },
  igButtonText: { fontSize: 16, fontWeight: '600', color: Colors.dark.background },
  homeButton: { marginTop: 16, paddingVertical: 12 },
  homeButtonText: { fontSize: 16, color: Colors.dark.textSecondary },
});
