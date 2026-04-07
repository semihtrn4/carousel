// Unique identifier: CAROUSEL_STUDIO_PROJECTS_001
import { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FolderOpen, Trash2, Image as ImageIcon } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import type { Project } from '@/types/project';

const UNIQUE_PROJECTS_MARKER = 'carousel_studio_projects_001';

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

async function deleteProject(projectId: string): Promise<void> {
  const stored = await AsyncStorage.getItem('carousel_projects');
  if (stored) {
    const projects = JSON.parse(stored) as Project[];
    const updated = projects.filter((p) => p.id !== projectId);
    await AsyncStorage.setItem('carousel_projects', JSON.stringify(updated));
  }
}

export default function CarouselStudioProjects() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: loadProjects,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const openProject = useCallback((projectId: string) => {
    router.push(`/editor?projectId=${projectId}`);
  }, [router]);

  const confirmDelete = useCallback((project: Project) => {
    Alert.alert('Delete Project', `Delete "${project.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(project.id) },
    ]);
  }, [deleteMutation]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderItem = ({ item }: { item: Project }) => (
    <TouchableOpacity style={styles.projectCard} onPress={() => openProject(item.id)} activeOpacity={0.8}>
      <View style={styles.projectPreview}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholder}>
            <ImageIcon size={40} color={Colors.dark.textMuted} />
          </View>
        )}
        <View style={styles.slideBadge}>
          <Text style={styles.slideCount}>{item.slides}</Text>
        </View>
      </View>
      <View style={styles.projectInfo}>
        <View style={styles.projectHeader}>
          <Text style={styles.projectName} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity style={styles.moreButton} onPress={() => confirmDelete(item)}>
            <Trash2 size={18} color={Colors.dark.textMuted} />
          </TouchableOpacity>
        </View>
        <Text style={styles.projectMeta}>{item.ratio} • {formatDate(item.updatedAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Projects</Text>
        <Text style={styles.subtitle}>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</Text>
      </View>

      {projects.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <FolderOpen size={48} color={Colors.dark.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No projects yet</Text>
          <Text style={styles.emptySubtitle}>Start creating beautiful carousels from the Home or Templates tab</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.dark.text },
  subtitle: { fontSize: 15, color: Colors.dark.textSecondary, marginTop: 4 },
  list: { padding: 20, gap: 16 },
  projectCard: { backgroundColor: Colors.dark.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.dark.border },
  projectPreview: { height: 200, backgroundColor: Colors.dark.surfaceElevated, position: 'relative' },
  thumbnail: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  slideBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  slideCount: { fontSize: 13, fontWeight: '600', color: Colors.dark.text },
  projectInfo: { padding: 16 },
  projectHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  projectName: { fontSize: 17, fontWeight: '600', color: Colors.dark.text, flex: 1 },
  moreButton: { padding: 8, marginRight: -8 },
  projectMeta: { fontSize: 14, color: Colors.dark.textMuted, marginTop: 4, textTransform: 'capitalize' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: { width: 96, height: 96, borderRadius: 24, backgroundColor: Colors.dark.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: Colors.dark.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: Colors.dark.textSecondary, textAlign: 'center', lineHeight: 22 },
});
