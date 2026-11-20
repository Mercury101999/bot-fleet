import '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-router', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  };
  (globalThis as { __botFleetRouter?: typeof router }).__botFleetRouter = router;
  return {
    router,
    useRouter: () => router,
    usePathname: () => (globalThis as { __botFleetPath?: string }).__botFleetPath ?? '/',
    useLocalSearchParams: () => (globalThis as { __botFleetParams?: Record<string, string | undefined> }).__botFleetParams ?? {},
    Link: ({ children }: { children: unknown }) => children,
    Redirect: () => null,
    Stack: { Screen: () => null },
    Tabs: ({ children }: { children: unknown }) => children,
  };
});

jest.mock('expo-system-ui', () => ({
  setBackgroundColorAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-linking', () => ({
  openURL: jest.fn(async () => undefined),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => undefined),
  hideAsync: jest.fn(async () => undefined),
}));
