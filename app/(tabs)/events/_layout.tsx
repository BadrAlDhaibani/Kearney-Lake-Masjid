import { Stack } from 'expo-router';
import { DetailHeader } from '@/src/components/ui/DetailHeader';

export default function EventsLayout() {
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
          header: () => <DetailHeader title="Event" />,
        }}
      />
    </Stack>
  );
}
