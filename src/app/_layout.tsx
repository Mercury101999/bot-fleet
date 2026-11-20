import { Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FleetProvider, useFleet } from '@/store/FleetStore';
import { fonts } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

import '@/global.css';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FleetProvider>
          <ThemedShell />
        </FleetProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedShell() {
  const { ready, locked } = useFleet();
  const { mode, colors } = useAppTheme();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center' }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1, width: '100%', maxWidth: 760, backgroundColor: colors.bg }}>
        {locked ? (
          <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 12 }}>
            <Text accessibilityRole="header" style={{ color: colors.ink, fontFamily: fonts.display, fontSize: 28 }}>
              This backup is newer
            </Text>
            <Text style={{ color: colors.muted, fontFamily: fonts.body, fontSize: 16, lineHeight: 23 }}>
              Bot Fleet found data from a newer version and left it untouched. Update the app before editing the fleet on this device.
            </Text>
          </View>
        ) : (
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="bot" />
            <Stack.Screen name="edit" />
          </Stack>
        )}
      </View>
    </View>
  );
}
