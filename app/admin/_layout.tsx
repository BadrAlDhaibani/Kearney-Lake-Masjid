import { Stack } from 'expo-router';
import { AdminGuard } from '@/src/components/admin/AdminGuard';
import { DetailHeader } from '@/src/components/ui/DetailHeader';

export default function AdminLayout() {
  return (
    <AdminGuard>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            header: () => <DetailHeader title="Admin Panel" />,
          }}
        />
        <Stack.Screen
          name="prayer-times"
          options={{
            header: () => <DetailHeader title="Manage Prayer Times" />,
          }}
        />
        <Stack.Screen
          name="announcements"
          options={{
            header: () => <DetailHeader title="Manage Announcements" />,
          }}
        />
        <Stack.Screen
          name="announcement-form"
          options={{
            header: () => <DetailHeader title="Edit Announcement" />,
          }}
        />
        <Stack.Screen
          name="events"
          options={{
            header: () => <DetailHeader title="Manage Events" />,
          }}
        />
        <Stack.Screen
          name="event-form"
          options={{
            header: () => <DetailHeader title="Edit Event" />,
          }}
        />
      </Stack>
    </AdminGuard>
  );
}
