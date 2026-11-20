import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';

import { reducer, initialState, type Action, type FleetState } from '@/lib/reducer';
import { asyncStorage, loadFleet, saveFleet, type KeyValueStore } from '@/lib/storage';

interface FleetContextValue {
  state: FleetState;
  ready: boolean;
  locked: boolean;
  dispatch: (action: Action) => void;
}

const FleetContext = createContext<FleetContextValue | null>(null);

export function FleetProvider({
  children,
  storage = asyncStorage,
  initial,
  persist = initial === undefined,
}: {
  children: ReactNode;
  storage?: KeyValueStore;
  initial?: FleetState;
  persist?: boolean;
}) {
  const [state, dispatch] = useReducer(reducer, initial ?? initialState);
  const [ready, setReady] = useState(initial !== undefined);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (initial) return undefined;
    let cancelled = false;
    loadFleet(storage)
      .then((loaded) => {
        if (cancelled) return;
        if (!loaded.ok) {
          setLocked(true);
          setReady(true);
          return;
        }
        if (loaded.fleet) dispatch({ type: 'hydrate', fleet: loaded.fleet });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [initial, storage]);

  useEffect(() => {
    if (!ready || !persist || locked) return undefined;
    const handle = setTimeout(() => {
      void saveFleet(storage, state);
    }, 200);
    return () => clearTimeout(handle);
  }, [ready, persist, locked, state, storage]);

  const value = useMemo<FleetContextValue>(
    () => ({
      state,
      ready,
      locked,
      dispatch: (action) => {
        if (!locked) dispatch(action);
      },
    }),
    [state, ready, locked],
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet(): FleetContextValue {
  const value = useContext(FleetContext);
  if (!value) throw new Error('useFleet must be used within FleetProvider');
  return value;
}
