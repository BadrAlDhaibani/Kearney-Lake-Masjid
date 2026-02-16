import { Stack } from 'expo-router';
import { AdminGuard } from '@/src/components/admin/AdminGuard';
import { HeaderBackButton } from '@/src/components/ui/HeaderBackButton';

export default function AdminLayout() {
  return (
    <AdminGuard>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackTitle: '',
          headerLeft: () => <HeaderBackButton />,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Admin Panel',
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
        <Stack.Screen
          name="events"
          options={{
            title: 'Manage Events',
          }}
        />
        <Stack.Screen
          name="event-form"
          options={{
            title: 'Edit Event',
          }}
        />
      </Stack>
    </AdminGuard>
  );
}
