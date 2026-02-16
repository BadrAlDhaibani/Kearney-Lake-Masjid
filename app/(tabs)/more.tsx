import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/constants/colors';
import { useAuth } from '@/src/contexts/AuthContext';

export default function MoreScreen() {
  const router = useRouter();
  const { session, profile, isAdmin, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>

        <Text style={styles.sectionHeader}>ACCOUNT</Text>

        {session ? (
          <>
            <View style={styles.profileCard}>
              <View style={styles.profileIconContainer}>
                <Ionicons name="person" size={28} color={colors.primary} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {profile?.full_name ?? 'Community Member'}
                </Text>
                <Text style={styles.profileEmail}>{session.user.email}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.menuItem, styles.signOutItem]}
              onPress={handleSignOut}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Sign Out"
              accessibilityHint="Sign out of your account"
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, styles.signOutIconContainer]}>
                  <Ionicons name="log-out-outline" size={24} color={colors.error} />
                </View>
                <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(auth)/sign-in')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
              accessibilityHint="Sign in to your account"
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="log-in-outline" size={24} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Sign In</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
            </TouchableOpacity>

          </>
        )}

        <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>GET IN TOUCH</Text>

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

        {isAdmin && (
          <>
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
          </>
        )}

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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
    gap: 12,
    marginBottom: 12,
  },
  profileIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
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
  signOutIconContainer: {
    backgroundColor: colors.errorLight,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  signOutItem: {
    marginTop: 12,
  },
  signOutText: {
    color: colors.error,
  },
});
