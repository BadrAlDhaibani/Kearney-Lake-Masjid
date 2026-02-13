import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContactCategories } from '@/src/hooks/useContactCategories';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ContactCategory } from '@/src/types/database';
import { colors } from '@/src/constants/colors';

function handleEmailPress(category: ContactCategory) {
  const subject = encodeURIComponent(`${category.name} Inquiry`);
  Linking.openURL(`mailto:${category.contact_email}?subject=${subject}`);
}

export default function ContactScreen() {
  const { categories, isLoading, error, refetch } = useContactCategories();

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Contact Us' }} />
        <LoadingSpinner message="Loading contact information..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: 'Contact Us' }} />
        <EmptyState
          icon="alert-circle-outline"
          title="Couldn't Load Contact Info"
          message={error}
          actionLabel="Try Again"
          onAction={refetch}
        />
      </>
    );
  }

  if (categories.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'Contact Us' }} />
        <EmptyState
          icon="mail-outline"
          title="No Contact Info Available"
          message="Please check back later."
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Contact Us' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleEmailPress(item)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Contact ${item.name}`}
              accessibilityHint={`Opens your mail app to send an email about ${item.name}`}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="mail-outline" size={24} color={colors.primary} />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.cardDescription}>{item.description}</Text>
                )}
                <Text style={styles.cardEmail}>{item.contact_email}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <Text style={styles.headerText}>
              Tap a category below to send us an email. Your mail app will open with the address pre-filled.
            </Text>
          )}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  headerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  cardEmail: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
});
