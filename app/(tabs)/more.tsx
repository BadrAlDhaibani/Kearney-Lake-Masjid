import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/constants/colors';

export default function MoreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.sectionHeader}>GET IN TOUCH</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/contact')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Contact Us"
          accessibilityHint="View contact options and send us an email"
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Contact Us</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
        </TouchableOpacity>

        <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>ADMINISTRATION</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/admin')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Admin Panel"
          accessibilityHint="Navigate to the admin panel"
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="settings-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Admin Panel</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.note}>
          For testing purposes only. Will require authentication in production.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionHeaderSpaced: {
    marginTop: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundWhite,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  note: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
