import { withLayoutContext } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createSwipeableTabNavigator } from '@/src/navigation/SwipeableTabNavigator';

const { Navigator } = createSwipeableTabNavigator();
const Tabs = withLayoutContext(Navigator);

export default function TabLayout() {
  return (
    <Tabs initialRouteName="prayer-times">
      <Tabs.Screen name="index" options={{ href: null } as any} />
      <Tabs.Screen
        name="prayer-times"
        options={{
          title: 'Prayer Times',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: 'News',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
