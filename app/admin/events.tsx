import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '@/src/hooks/useEvents';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { supabase } from '@/src/lib/supabase';
import { Event } from '@/src/types/database';
import { formatEventDateTime } from '@/src/lib/utils';
import { colors } from '@/src/constants/colors';

export default function EventsAdminScreen() {
  const router = useRouter();
  const { events, isLoading, error, refetch } = useEvents(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = () => {
    router.push('/admin/event-form');
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/event-form?id=${id}`);
  };

  const handleTogglePublish = async (event: Event) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_published: !event.is_published })
        .eq('id', event.id);

      if (error) throw error;

      await refetch();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to update event');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(id);
            try {
              const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', id);

              if (error) throw error;

              await refetch();
            } catch (err: any) {
              Alert.alert('Error', err.message ?? 'Failed to delete event');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading events..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Error Loading Events"
        message={error}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreate}
          accessibilityRole="button"
          accessibilityLabel="Create new event"
        >
          <Ionicons name="add-circle" size={20} color={colors.white} />
          <Text style={styles.createButtonText}>Create New</Text>
        </TouchableOpacity>
      </View>

      {events.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No Events"
          message="Create your first event to get started."
          actionLabel="Create Event"
          onAction={handleCreate}
        />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      item.is_published ? styles.publishedBadge : styles.draftBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.is_published ? styles.publishedText : styles.draftText,
                      ]}
                    >
                      {item.is_published ? 'Published' : 'Draft'}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.cardMeta}>
                    {formatEventDateTime(item.start_time)}
                  </Text>
                </View>

                {item.location && (
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                    <Text style={styles.cardMeta}>{item.location}</Text>
                  </View>
                )}
              </View>

              {item.description && (
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEdit(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${item.title}`}
                >
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleTogglePublish(item)}
                  accessibilityRole="button"
                  accessibilityLabel={item.is_published ? `Unpublish ${item.title}` : `Publish ${item.title}`}
                >
                  <Ionicons
                    name={item.is_published ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.actionButtonText}>
                    {item.is_published ? 'Unpublish' : 'Publish'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${item.title}`}
                  accessibilityState={{ disabled: deletingId === item.id }}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                  <Text style={[styles.actionButtonText, styles.deleteText]}>
                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  createButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  publishedBadge: {
    backgroundColor: colors.primaryTint,
  },
  draftBadge: {
    backgroundColor: colors.warningBackground,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  publishedText: {
    color: colors.primary,
  },
  draftText: {
    color: colors.warning,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textMedium,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.background,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  deleteText: {
    color: colors.error,
  },
});
