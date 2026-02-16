import React from 'react';
import {
  createNavigatorFactory,
  DefaultNavigatorOptions,
  ParamListBase,
  TabActionHelpers,
  TabNavigationState,
  TabRouter,
  TabRouterOptions,
  useNavigationBuilder,
} from '@react-navigation/native';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  useWindowDimensions,
} from 'react-native';
import { TabView } from 'react-native-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/constants/colors';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

export type SwipeableTabNavigationOptions = {
  title?: string;
  tabBarIcon?: (props: { color: string; focused: boolean; size: number }) => React.ReactNode;
  // Expo Router passes href as an option — we use it to filter hidden screens
  href?: string | null | object;
};

type SwipeableTabNavigationEventMap = {
  tabPress: { data: undefined; canPreventDefault: true };
};

type Props = DefaultNavigatorOptions<
  ParamListBase,
  string | undefined,
  TabNavigationState<ParamListBase>,
  SwipeableTabNavigationOptions,
  SwipeableTabNavigationEventMap,
  any
> &
  TabRouterOptions;

function SwipeableTabNavigator({
  initialRouteName,
  backBehavior,
  children,
  screenOptions,
}: Props) {
  const { state, navigation, descriptors, NavigationContent } = useNavigationBuilder<
    TabNavigationState<ParamListBase>,
    TabRouterOptions,
    TabActionHelpers<ParamListBase>,
    SwipeableTabNavigationOptions,
    SwipeableTabNavigationEventMap
  >(TabRouter, {
    children,
    screenOptions,
    initialRouteName,
    backBehavior,
  });

  const layout = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Filter out hidden routes (href: null) and routes without a tab icon
  const visibleRoutes = state.routes.filter(
    (route) => descriptors[route.key]?.options?.href !== null && !!descriptors[route.key]?.options?.tabBarIcon
  );

  const currentIndex = Math.max(
    0,
    visibleRoutes.findIndex((r) => r.key === state.routes[state.index].key)
  );

  const pagerRoutes = visibleRoutes.map((route) => ({
    key: route.key,
    title: descriptors[route.key]?.options?.title ?? route.name,
  }));

  const renderScene = ({ route }: { route: { key: string } }) =>
    descriptors[route.key]?.render() ?? null;

  return (
    <NavigationContent>
      <View style={styles.container}>
        <TabView
          navigationState={{ index: currentIndex, routes: pagerRoutes }}
          renderScene={renderScene}
          onIndexChange={(index) => {
            navigation.navigate(visibleRoutes[index].name);
          }}
          renderTabBar={() => null}
          layout={layout}
          lazy
          renderLazyPlaceholder={() => <LoadingSpinner />}
        />

        <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          {visibleRoutes.map((route, index) => {
            const options = descriptors[route.key]?.options ?? {};
            const focused = currentIndex === index;
            const color = focused ? colors.primary : colors.tabInactive;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tabItem}
                onPress={onPress}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={options.title ?? route.name}
              >
                {options.tabBarIcon?.({ color, focused, size: 24 })}
                <Text style={[styles.tabLabel, { color }]}>
                  {options.title ?? route.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </NavigationContent>
  );
}

export const createSwipeableTabNavigator = createNavigatorFactory<
  TabNavigationState<ParamListBase>,
  SwipeableTabNavigationOptions,
  SwipeableTabNavigationEventMap,
  typeof SwipeableTabNavigator
>(SwipeableTabNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundWhite,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
