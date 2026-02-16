import { Stack } from 'expo-router';
import { DetailHeader } from '@/src/components/ui/DetailHeader';

export default function AnnouncementsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          header: () => <DetailHeader title="Announcement" />,
        }}
      />
    </Stack>
  );
}
