// Unique identifier: CAROUSEL_STUDIO_SETTINGS_001
import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Palette, Grid3X3, Trash2, Info } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

const UNIQUE_SETTINGS_MARKER = 'carousel_studio_settings_001';

const RATIOS = [
  { id: 'square', name: 'Square', label: '1:1', desc: 'Instagram feed' },
  { id: 'portrait', name: 'Portrait', label: '4:5', desc: 'Best for engagement' },
  { id: 'story', name: 'Story', label: '9:16', desc: 'Full screen story' },
  { id: 'landscape', name: 'Landscape', label: '16:9', desc: 'Wide format' },
];

const SLIDE_OPTIONS = [2, 3, 4, 5, 10];

export default function CarouselStudioSettings() {
  const [defaultRatio, setDefaultRatio] = useState('portrait');
  const [defaultSlides, setDefaultSlides] = useState(3);
  const [autoSave, setAutoSave] = useState(true);
  const [highQuality, setHighQuality] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const r = await AsyncStorage.getItem('settings_default_ratio');
      const s = await AsyncStorage.getItem('settings_default_slides');
      const a = await AsyncStorage.getItem('settings_auto_save');
      const q = await AsyncStorage.getItem('settings_high_quality');
      if (r) setDefaultRatio(r);
      if (s) setDefaultSlides(parseInt(s, 10));
      if (a !== null) setAutoSave(a === 'true');
      if (q !== null) setHighQuality(q === 'true');
    } catch (e) {
      console.error('Settings load error:', e);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(`settings_${key}`, value);
    } catch (e) {
      console.error('Settings save error:', e);
    }
  };

  const clearCache = useCallback(() => {
    Alert.alert('Clear Cache', 'Remove cached images? Your projects will not be affected.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter((k) => k.startsWith('cache_'));
            await AsyncStorage.multiRemove(cacheKeys);
            Alert.alert('Success', 'Cache cleared');
          } catch {
            Alert.alert('Error', 'Failed to clear cache');
          }
        },
      },
    ]);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Defaults</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Palette size={20} color={Colors.dark.textSecondary} />
              <Text style={styles.rowLabel}>Default Aspect Ratio</Text>
            </View>
            <View style={styles.optionsRow}>
              {RATIOS.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.ratioOption, defaultRatio === r.id && styles.ratioOptionActive]}
                  onPress={() => { setDefaultRatio(r.id); saveSetting('default_ratio', r.id); }}
                >
                  <Text style={[styles.ratioLabel, defaultRatio === r.id && styles.ratioLabelActive]}>{r.label}</Text>
                  <Text style={styles.ratioDesc}>{r.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.card, { marginTop: 12 }]}>
            <View style={styles.row}>
              <Grid3X3 size={20} color={Colors.dark.textSecondary} />
              <Text style={styles.rowLabel}>Default Slide Count</Text>
            </View>
            <View style={styles.slidesRow}>
              {SLIDE_OPTIONS.map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.slideOption, defaultSlides === n && styles.slideOptionActive]}
                  onPress={() => { setDefaultSlides(n); saveSetting('default_slides', n.toString()); }}
                >
                  <Text style={[styles.slideNumber, defaultSlides === n && styles.slideNumberActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Auto-save projects</Text>
              <Switch
                value={autoSave}
                onValueChange={(v) => { setAutoSave(v); saveSetting('auto_save', v.toString()); }}
                trackColor={{ false: Colors.dark.border, true: Colors.dark.accent }}
                thumbColor={autoSave ? Colors.dark.background : Colors.dark.textMuted}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>High quality export</Text>
              <Switch
                value={highQuality}
                onValueChange={(v) => { setHighQuality(v); saveSetting('high_quality', v.toString()); }}
                trackColor={{ false: Colors.dark.border, true: Colors.dark.accent }}
                thumbColor={highQuality ? Colors.dark.background : Colors.dark.textMuted}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <TouchableOpacity style={styles.card} onPress={clearCache}>
            <View style={styles.actionRow}>
              <Trash2 size={20} color={Colors.dark.error} />
              <Text style={[styles.actionText, { color: Colors.dark.error }]}>Clear Cache</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Info size={20} color={Colors.dark.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Version</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Carousel Studio</Text>
          <Text style={styles.footerSub}>Create beautiful seamless Instagram carousels</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.dark.text },
  scroll: { flex: 1 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.dark.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  card: { backgroundColor: Colors.dark.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.dark.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  rowLabel: { fontSize: 15, fontWeight: '500', color: Colors.dark.text },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ratioOption: { flex: 1, minWidth: 70, backgroundColor: Colors.dark.surfaceElevated, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
  ratioOptionActive: { backgroundColor: Colors.dark.accent, borderColor: Colors.dark.accent },
  ratioLabel: { fontSize: 16, fontWeight: '700', color: Colors.dark.text },
  ratioLabelActive: { color: Colors.dark.background },
  ratioDesc: { fontSize: 11, color: Colors.dark.textMuted, marginTop: 2 },
  slidesRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  slideOption: { flex: 1, aspectRatio: 1, backgroundColor: Colors.dark.surfaceElevated, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
  slideOptionActive: { backgroundColor: Colors.dark.accent, borderColor: Colors.dark.accent },
  slideNumber: { fontSize: 18, fontWeight: '700', color: Colors.dark.text },
  slideNumberActive: { color: Colors.dark.background },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  toggleLabel: { fontSize: 15, color: Colors.dark.text },
  divider: { height: 1, backgroundColor: Colors.dark.border, marginVertical: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionText: { fontSize: 15, fontWeight: '500' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 15, color: Colors.dark.text },
  infoValue: { fontSize: 14, color: Colors.dark.textMuted, marginTop: 2 },
  footer: { paddingVertical: 40, alignItems: 'center' },
  footerText: { fontSize: 16, fontWeight: '600', color: Colors.dark.textMuted },
  footerSub: { fontSize: 13, color: Colors.dark.textMuted, marginTop: 4 },
});
