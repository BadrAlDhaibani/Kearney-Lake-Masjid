import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/constants/colors';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.backgroundWhite,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.textPrimary,
        },
        headerBackTitle: '',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Admin Panel',
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="prayer-times"
        options={{
          title: 'Manage Prayer Times',
        }}
      />
      <Stack.Screen
        name="announcements"
        options={{
          title: 'Manage Announcements',
        }}
      />
      <Stack.Screen
        name="announcement-form"
        options={{
          title: 'Edit Announcement',
        }}
      />
    </Stack>
  );
}

function HeaderBackButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ marginLeft: 8 }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
    </TouchableOpacity>
  );
}
