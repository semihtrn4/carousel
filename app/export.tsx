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
  const [exportSecs, setExportSecs] = useState(0);
  const [exportStep, setExportStep] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const imageData = params.imageData as string;
  const slides = parseInt(params.slides as string) || 3;
  const ratio = (params.ratio as string) || 'portrait';
  const canvasData = params.canvasData as string | undefined;
  const projectId = params.projectId as string | undefined;

  const dims = RATIOS[ratio as keyof typeof RATIOS] || RATIOS.portrait;

  const saveProjectToApp = useCallback(async (thumbnail: string, name: string) => {
    try {
      const stored = await AsyncStorage.getItem('carousel_projects');
      const projects: Project[] = stored ? JSON.parse(stored) : [];
      const now = Date.now();

      if (projectId) {
        // Mevcut projeyi güncelle
        const idx = projects.findIndex(p => p.id === projectId);
        if (idx >= 0) {
          projects[idx] = { ...projects[idx], name, thumbnail, canvasData, updatedAt: now };
        }
      } else {
        // Yeni proje oluştur
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

  const exportImages = useCallback(async (name: string) => {
    setExporting(true);
    setExportSecs(0);
    setExportStep('İzin alınıyor...');
    setShowNameModal(false);
    timerRef.current = setInterval(() => setExportSecs(s => s + 1), 1000);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save photos to your gallery.');
        setExporting(false);
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        return;
      }

      setExportStep('Görsel boyutlandırılıyor...');
      const sizeResult = await ImageManipulator.manipulateAsync(imageData, [], {});
      const imageWidth = sizeResult.width;
      const imageHeight = sizeResult.height;
      const cropW = Math.floor(imageWidth / slides);

      setExportStep(`${slides} slide kırpılıyor...`);
      // Tüm crop işlemlerini paralel çalıştır
      const cropResults = await Promise.all(
        Array.from({ length: slides }, (_, i) =>
          ImageManipulator.manipulateAsync(
            imageData,
            [{ crop: { originX: i * cropW, originY: 0, width: cropW, height: imageHeight } }],
            { format: ImageManipulator.SaveFormat.JPEG, compress: 0.92 }
          )
        )
      );

      setExportStep('Galeriye kaydediliyor...');
      const assets = await Promise.all(cropResults.map(r => MediaLibrary.createAssetAsync(r.uri)));

      setExportStep('Proje kaydediliyor...');
      const thumbResult = await ImageManipulator.manipulateAsync(
        imageData,
        [{ crop: { originX: 0, originY: 0, width: cropW, height: imageHeight } }, { resize: { width: 400 } }],
        { format: ImageManipulator.SaveFormat.JPEG, compress: 0.7, base64: true }
      );
      const thumbnail = `data:image/jpeg;base64,${thumbResult.base64}`;
      await saveProjectToApp(thumbnail, name);

      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setSavedCount(assets.length);
      setCompleted(true);
    } catch (error) {
      console.error('Export error:', error);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
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
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(webUrl);
      }
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
          <Text style={styles.successTitle}>Success!</Text>
          <Text style={styles.successSub}>{savedCount} photos saved to your gallery</Text>

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Next Steps:</Text>
            <Text style={styles.instructionsText}>
              1. Open Instagram{'\n'}
              2. Tap New Post{'\n'}
              3. Select Multiple{'\n'}
              4. Pick the saved photos in order
            </Text>
          </View>

          <TouchableOpacity style={styles.igButton} onPress={openInstagram}>
            <Instagram size={24} color={Colors.dark.background} />
            <Text style={styles.igButtonText}>Open Instagram</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeButton} onPress={goHome}>
            <Text style={styles.homeButtonText}>Back to Home</Text>
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
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Ready to Export</Text>
        <Text style={styles.infoSub}>This will be split into {slides} slides ({dims.width}x{dims.height}px each)</Text>
      </View>

      {exporting ? (
        <View style={styles.exporting}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
          <Text style={styles.exportingText}>{exportStep}</Text>
          <Text style={styles.exportingTimer}>{exportSecs}s geçti...</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.exportBtn} onPress={() => setShowNameModal(true)}>
          <Download size={24} color={Colors.dark.background} />
          <Text style={styles.exportBtnText}>Save to Gallery</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showNameModal} transparent animationType="slide" onRequestClose={() => setShowNameModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Project Name</Text>
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
              <Text style={styles.exportBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowNameModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
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
  preview: { flex: 1, padding: 20, justifyContent: 'center' },
  previewImage: { width: '100%', height: '100%', borderRadius: 12 },
  info: { paddingHorizontal: 20, paddingBottom: 20, alignItems: 'center' },
  infoTitle: { fontSize: 18, fontWeight: '600', color: Colors.dark.text },
  infoSub: { fontSize: 14, color: Colors.dark.textMuted, marginTop: 4, textAlign: 'center' },
  exporting: { padding: 40, alignItems: 'center' },
  exportingText: { marginTop: 16, fontSize: 16, color: Colors.dark.textSecondary },
  exportingTimer: { marginTop: 8, fontSize: 13, color: Colors.dark.textMuted },
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
