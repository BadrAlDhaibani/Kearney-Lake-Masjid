import { Stack } from 'expo-router';
import { colors } from '@/src/constants/colors';

export default function AnnouncementsLayout() {
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
          title: 'News',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Announcement',
          headerBackTitle: '',
        }}
      />
    </Stack>
  );
}
