import { act, render, type RenderOptions } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

const initialMetrics: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

import { initialState, type FleetState } from '@/lib/reducer';
import { FleetProvider } from '@/store/FleetStore';

interface FleetRouterMock {
  push: jest.Mock;
  replace: jest.Mock;
  back: jest.Mock;
  canGoBack: jest.Mock;
}

export function fleetRouter(): FleetRouterMock {
  return (globalThis as unknown as { __botFleetRouter: FleetRouterMock }).__botFleetRouter;
}

export function setFleetParams(params: Record<string, string | undefined>) {
  (globalThis as { __botFleetParams?: Record<string, string | undefined> }).__botFleetParams = params;
}

export async function renderWithStore(ui: ReactElement, state?: Partial<FleetState>, options?: RenderOptions) {
  const initial: FleetState = {
    ...initialState,
    ...state,
    settings: state?.settings ?? initialState.settings,
    bots: state?.bots ?? [],
    links: state?.links ?? [],
  };
  const view = await render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <FleetProvider initial={initial} persist={false}>
        {ui}
      </FleetProvider>
    </SafeAreaProvider>,
    options,
  );
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}
