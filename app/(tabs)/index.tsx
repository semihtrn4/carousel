// Unique identifier: CAROUSEL_STUDIO_HOME_001
import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Image as ImageIcon, Grid3X3, Layout, Film } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { TEMPLATES } from '@/constants/templates';
import type { Project } from '@/types/project';

const UNIQUE_HOME_MARKER = 'carousel_studio_home_001';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'carousel', name: 'Carousel', icon: Layout },
  { id: 'collage', name: 'Collage', icon: Grid3X3 },
  { id: 'story', name: 'Story', icon: Film },
];

async function loadProjects(): Promise<Project[]> {
  try {
    const stored = await AsyncStorage.getItem('carousel_projects');
    if (stored) {
      const projects = JSON.parse(stored) as Project[];
      return projects.sort((a, b) => b.updatedAt - a.updatedAt);
    }
  } catch (error) {
    console.error('Error loading projects:', error);
  }
  return [];
}

export default function CarouselStudioHome() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('carousel');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: loadProjects,
  });

  const recentTemplates = TEMPLATES.slice(0, 5);

  const startNewProject = useCallback(() => {
    router.push('/templates');
  }, [router]);

  const openProject = useCallback((projectId: string) => {
    router.push(`/editor?projectId=${projectId}`);
  }, [router]);

  const useTemplate = useCallback((templateId: string) => {
    router.push(`/editor?templateId=${templateId}`);
  }, [router]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Carousel Studio</Text>
          <Text style={styles.subtitle}>Create seamless Instagram carousels</Text>
        </View>

        <TouchableOpacity style={styles.newProjectButton} onPress={startNewProject}>
          <View style={styles.newProjectIcon}>
            <Plus size={32} color={Colors.dark.background} />
          </View>
          <Text style={styles.newProjectText}>New Project</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesRow}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Icon size={24} color={isSelected ? Colors.dark.background : Colors.dark.text} />
                  <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Templates</Text>
          <FlatList
            data={recentTemplates}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.templatesList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.templateCard} onPress={() => useTemplate(item.id)}>
                <View style={[styles.templatePreview, { backgroundColor: item.elements[0]?.color || '#333' }]}>
                  <Text style={styles.templateSlides}>{item.slides} slides</Text>
                </View>
                <Text style={styles.templateName}>{item.name}</Text>
                <Text style={styles.templateCategory}>{item.category}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          {projects.length === 0 ? (
            <View style={styles.emptyState}>
              <ImageIcon size={48} color={Colors.dark.textMuted} />
              <Text style={styles.emptyStateText}>No projects yet</Text>
              <Text style={styles.emptyStateSubtext}>Create your first carousel to get started</Text>
            </View>
          ) : (
            <View style={styles.projectsGrid}>
              {projects.map((project) => (
                <TouchableOpacity key={project.id} style={styles.projectCard} onPress={() => openProject(project.id)}>
                  <View style={styles.projectPreview}>
                    {project.thumbnail ? (
                      <Image source={{ uri: project.thumbnail }} style={styles.projectThumbnail} />
                    ) : (
                      <View style={styles.projectPlaceholder}>
                        <Layout size={32} color={Colors.dark.textMuted} />
                      </View>
                    )}
                    <View style={styles.projectOverlay}>
                      <Text style={styles.projectSlides}>{project.slides}</Text>
                    </View>
                  </View>
                  <Text style={styles.projectName} numberOfLines={1}>{project.name}</Text>
                  <Text style={styles.projectDate}>{formatDate(project.updatedAt)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', color: Colors.dark.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: Colors.dark.textSecondary, marginTop: 4 },
  newProjectButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.accent, marginHorizontal: 20, padding: 16, borderRadius: 16, gap: 12 },
  newProjectIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.dark.background, justifyContent: 'center', alignItems: 'center' },
  newProjectText: { fontSize: 18, fontWeight: '600', color: Colors.dark.background },
  section: { marginTop: 32, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: Colors.dark.text, marginBottom: 16 },
  categoriesRow: { flexDirection: 'row', gap: 12 },
  categoryCard: { flex: 1, backgroundColor: Colors.dark.surface, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.dark.border },
  categoryCardSelected: { backgroundColor: Colors.dark.accent, borderColor: Colors.dark.accent },
  categoryText: { fontSize: 13, fontWeight: '500', color: Colors.dark.text },
  categoryTextSelected: { color: Colors.dark.background },
  templatesList: { gap: 12, paddingRight: 20 },
  templateCard: { width: 140 },
  templatePreview: { width: 140, height: 180, borderRadius: 12, justifyContent: 'flex-end', padding: 12 },
  templateSlides: { fontSize: 12, fontWeight: '600', color: '#000', backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  templateName: { fontSize: 14, fontWeight: '500', color: Colors.dark.text, marginTop: 8 },
  templateCategory: { fontSize: 12, color: Colors.dark.textMuted, textTransform: 'capitalize' },
  emptyState: { backgroundColor: Colors.dark.surface, borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
  emptyStateText: { fontSize: 16, fontWeight: '500', color: Colors.dark.text, marginTop: 12 },
  emptyStateSubtext: { fontSize: 14, color: Colors.dark.textMuted, marginTop: 4, textAlign: 'center' },
  projectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  projectCard: { width: (SCREEN_WIDTH - 52) / 2 },
  projectPreview: { width: '100%', aspectRatio: 4 / 5, borderRadius: 12, overflow: 'hidden', backgroundColor: Colors.dark.surface, position: 'relative' },
  projectThumbnail: { width: '100%', height: '100%' },
  projectPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  projectOverlay: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  projectSlides: { fontSize: 11, fontWeight: '600', color: Colors.dark.text },
  projectName: { fontSize: 14, fontWeight: '500', color: Colors.dark.text, marginTop: 8 },
  projectDate: { fontSize: 12, color: Colors.dark.textMuted, marginTop: 2 },
});
