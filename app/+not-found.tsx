// Unique identifier: CAROUSEL_STUDIO_404_001
import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

const UNIQUE_404_MARKER = 'carousel_studio_404_001';

export default function CarouselStudioNotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={styles.errorContainer}>
        <Text style={styles.errorCode}>404</Text>
        <Text style={styles.errorTitle}>Page Not Found</Text>
        <Text style={styles.errorSubtitle}>This screen does not exist in Carousel Studio.</Text>
        <Link href="/" style={styles.homeLink}>
          <Text style={styles.homeLinkText}>Go to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.dark.background,
  },
  errorCode: {
    fontSize: 80,
    fontWeight: '700',
    color: Colors.dark.accent,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  homeLink: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  homeLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.accent,
  },
});
