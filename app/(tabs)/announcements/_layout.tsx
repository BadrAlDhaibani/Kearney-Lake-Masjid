import { Stack } from 'expo-router';
import { HeaderBackButton } from '@/src/components/ui/HeaderBackButton';

export default function AnnouncementsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: false,
        headerLeft: () => <HeaderBackButton />,
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
        }}
      />
    </Stack>
  );
}
