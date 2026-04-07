// Unique identifier: CAROUSEL_STUDIO_TEMPLATES_001
import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layers } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { TEMPLATES, type Template } from '@/constants/templates';

const UNIQUE_TEMPLATES_MARKER = 'carousel_studio_templates_001';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'editorial', name: 'Editorial' },
  { id: 'scrapbook', name: 'Scrapbook' },
  { id: 'bold', name: 'Bold' },
  { id: 'aesthetic', name: 'Aesthetic' },
];

export default function CarouselStudioTemplates() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTemplates = TEMPLATES.filter(
    (t) => selectedCategory === 'all' || t.category === selectedCategory
  );

  const useTemplate = useCallback((template: Template) => {
    router.push({
      pathname: '/editor',
      params: {
        templateId: template.id,
        slides: template.slides.toString(),
        ratio: template.ratio,
      },
    });
  }, [router]);

  const startBlank = useCallback(() => {
    router.push({
      pathname: '/editor',
      params: {
        slides: '3',
        ratio: 'portrait',
      },
    });
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Templates</Text>
        <Text style={styles.subtitle}>Choose a starting point for your design</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryButton, selectedCategory === cat.id && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.blankCard} onPress={startBlank}>
        <View style={styles.blankIcon}>
          <Layers size={32} color={Colors.dark.text} />
        </View>
        <View style={styles.blankInfo}>
          <Text style={styles.blankTitle}>Blank Canvas</Text>
          <Text style={styles.blankSubtitle}>Start from scratch</Text>
        </View>
        <Text style={styles.blankArrow}>→</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredTemplates}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.templateCard} onPress={() => useTemplate(item)}>
            <View style={[styles.templatePreview, { backgroundColor: item.elements[0]?.color || Colors.dark.surfaceElevated }]}>
              <View style={styles.slideIndicator}>
                <Text style={styles.slideCount}>{item.slides}</Text>
                <Text style={styles.slideLabel}>slides</Text>
              </View>
              <View style={styles.ratioBadge}>
                <Text style={styles.ratioText}>{item.ratio}</Text>
              </View>
            </View>
            <Text style={styles.templateName}>{item.name}</Text>
            <Text style={styles.templateCategory}>{item.category}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No templates in this category</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.dark.text },
  subtitle: { fontSize: 15, color: Colors.dark.textSecondary, marginTop: 4 },
  categoriesContainer: { paddingHorizontal: 20, gap: 8, paddingBottom: 16 },
  categoryButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.dark.surface, marginRight: 8, borderWidth: 1, borderColor: Colors.dark.border },
  categoryButtonActive: { backgroundColor: Colors.dark.accent, borderColor: Colors.dark.accent },
  categoryText: { fontSize: 14, fontWeight: '500', color: Colors.dark.textSecondary },
  categoryTextActive: { color: Colors.dark.background, fontWeight: '600' },
  blankCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.surface, marginHorizontal: 20, marginBottom: 20, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.dark.border },
  blankIcon: { width: 56, height: 56, borderRadius: 12, backgroundColor: Colors.dark.surfaceElevated, justifyContent: 'center', alignItems: 'center' },
  blankInfo: { flex: 1, marginLeft: 16 },
  blankTitle: { fontSize: 17, fontWeight: '600', color: Colors.dark.text },
  blankSubtitle: { fontSize: 14, color: Colors.dark.textMuted, marginTop: 2 },
  blankArrow: { fontSize: 20, color: Colors.dark.textSecondary },
  grid: { paddingHorizontal: 20, paddingBottom: 100 },
  row: { gap: 12, marginBottom: 12 },
  templateCard: { width: (SCREEN_WIDTH - 52) / 2 },
  templatePreview: { width: '100%', aspectRatio: 4 / 5, borderRadius: 16, padding: 12, justifyContent: 'space-between' },
  slideIndicator: { alignSelf: 'flex-start' },
  slideCount: { fontSize: 24, fontWeight: '700', color: '#000' },
  slideLabel: { fontSize: 11, color: '#000', opacity: 0.7 },
  ratioBadge: { alignSelf: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  ratioText: { fontSize: 11, fontWeight: '600', color: Colors.dark.text, textTransform: 'uppercase' },
  templateName: { fontSize: 15, fontWeight: '600', color: Colors.dark.text, marginTop: 10 },
  templateCategory: { fontSize: 13, color: Colors.dark.textMuted, textTransform: 'capitalize', marginTop: 2 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: Colors.dark.textMuted },
});
