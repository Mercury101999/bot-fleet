import AsyncStorage from '@react-native-async-storage/async-storage';

import { LEGACY_STORAGE_KEY, STORAGE_KEY } from '@/lib/constants';
import { migrateRaw, sanitizeFleet, toStored, type UnsupportedLoad } from '@/lib/migrate';
import type { FleetData } from '@/lib/types';

export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export const asyncStorage: KeyValueStore = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
};

export type StoredLoad = { ok: true; fleet: FleetData | null } | UnsupportedLoad;

export async function loadFleet(store: KeyValueStore): Promise<StoredLoad> {
  try {
    const current = await store.getItem(STORAGE_KEY);
    const legacy = current ? null : await store.getItem(LEGACY_STORAGE_KEY);
    const raw = current ?? legacy;
    if (!raw) return { ok: true, fleet: null };
    const parsed = JSON.parse(raw) as unknown;
    const migrated = migrateRaw(parsed);
    if (!migrated.ok) return migrated.reason === 'unsupported' ? { ok: false, reason: 'unsupported' } : { ok: true, fleet: null };
    return { ok: true, fleet: sanitizeFleet(migrated.value) };
  } catch {
    return { ok: true, fleet: null };
  }
}

export async function saveFleet(store: KeyValueStore, fleet: FleetData): Promise<void> {
  await store.setItem(STORAGE_KEY, JSON.stringify(toStored(fleet)));
}
