import { Stack } from 'expo-router';
import { HeaderBackButton } from '@/src/components/ui/HeaderBackButton';

export default function EventsLayout() {
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
          title: 'Events',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Event',
        }}
      />
    </Stack>
  );
}
