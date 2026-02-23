import { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAnnouncements } from '@/src/hooks/useAnnouncements';
import { DetailHeader } from '@/src/components/ui/DetailHeader';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { supabase } from '@/src/lib/supabase';
import { Announcement } from '@/src/types/database';
import { formatAnnouncementDate } from '@/src/lib/utils';
import { colors } from '@/src/constants/colors';

export default function AnnouncementsAdminScreen() {
  const router = useRouter();
  const { announcements, isLoading, error, refetch } = useAnnouncements(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Re-fetch when screen regains focus (e.g. returning from create/edit form)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreate = () => {
    router.push('/admin/announcement-form');
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/announcement-form?id=${id}`);
  };

  const handleTogglePublish = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          is_published: !announcement.is_published,
          published_at: !announcement.is_published ? new Date().toISOString() : announcement.published_at,
        })
        .eq('id', announcement.id);

      if (error) throw error;

      await refetch();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to update announcement');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Announcement',
      'Are you sure you want to delete this announcement? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(id);
            try {
              const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id);

              if (error) throw error;

              await refetch();
            } catch (err: any) {
              Alert.alert('Error', err.message ?? 'Failed to delete announcement');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading announcements..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Error Loading Announcements"
        message={error}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <DetailHeader
              title="Manage Announcements"
              rightAction={
                <TouchableOpacity
                  style={styles.headerCreateButton}
                  onPress={handleCreate}
                  accessibilityRole="button"
                  accessibilityLabel="Create new announcement"
                  hitSlop={8}
                >
                  <Ionicons name="add" size={16} color={colors.white} />
                  <Text style={styles.headerCreateText}>Create New</Text>
                </TouchableOpacity>
              }
            />
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
      {announcements.length === 0 ? (
        <EmptyState
          icon="newspaper-outline"
          title="No Announcements"
          message="Create your first announcement to get started."
          actionLabel="Create Announcement"
          onAction={handleCreate}
        />
      ) : (
        <FlatList
          data={announcements}
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
                <Text style={styles.cardDate}>
                  {formatAnnouncementDate(item.published_at || item.created_at)}
                </Text>
              </View>

              <Text style={styles.cardContent} numberOfLines={2}>
                {item.content}
              </Text>

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerCreateText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
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
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  cardDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardContent: {
    fontSize: 14,
    color: colors.textMedium,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
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
