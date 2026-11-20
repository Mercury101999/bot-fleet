import { Tabs } from 'expo-router';

import { BotsIcon, HomeIcon, MapIcon, SettingsIcon } from '@/components/icons';
import { fonts } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

export default function TabLayout() {
  const { colors } = useAppTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          minHeight: 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bodyMedium,
          fontSize: 12,
        },
        tabBarItemStyle: {
          minHeight: 48,
        },
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarAccessibilityLabel: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="bots"
        options={{
          title: 'Bots',
          tabBarAccessibilityLabel: 'Bots',
          tabBarIcon: ({ color }) => <BotsIcon color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarAccessibilityLabel: 'Map',
          tabBarIcon: ({ color }) => <MapIcon color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarAccessibilityLabel: 'Settings',
          tabBarIcon: ({ color }) => <SettingsIcon color={String(color)} />,
        }}
      />
    </Tabs>
  );
}
