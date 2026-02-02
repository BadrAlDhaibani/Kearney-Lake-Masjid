import { Stack } from 'expo-router';

export default function AnnouncementsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: '#1B5E20',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Announcement',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
