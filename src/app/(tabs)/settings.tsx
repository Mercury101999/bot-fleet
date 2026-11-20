import Constants from 'expo-constants';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, ConfirmDialog, DisplayTitle, Field, LoadExampleButton, Notice, Screen, SectionHeading } from '@/components/ui';
import { downloadText, pickTextFile } from '@/lib/download';
import { createId } from '@/lib/id';
import { parseFleetImport, serializeFleet } from '@/lib/transfer';
import type { FleetData, ThemePreference } from '@/lib/types';
import { useFleet } from '@/store/FleetStore';
import { fonts } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

const THEMES: { id: ThemePreference; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const { state, dispatch } = useFleet();
  const { colors, preference } = useAppTheme();
  const [raw, setRaw] = useState('');
  const [exported, setExported] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<FleetData | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  function applyImport(fleet: FleetData) {
    dispatch({ type: 'importFleet', fleet });
    setMessage(`Imported ${fleet.bots.length} ${fleet.bots.length === 1 ? 'bot' : 'bots'}.`);
    setPending(null);
    setRaw('');
  }

  function requestImport(text: string) {
    const parsed = parseFleetImport(text, createId);
    if (!parsed.ok) {
      setMessage(parsed.error);
      setPending(null);
      return;
    }
    if (state.bots.length > 0) {
      setPending(parsed.value);
      setMessage('');
      return;
    }
    applyImport(parsed.value);
  }

  return (
    <Screen>
      <DisplayTitle title="Settings" subtitle="Theme, backup, and the example fleet. Nothing here leaves the device." />
      <SectionHeading title="Appearance" />
      <View style={styles.themes}>
        {THEMES.map((theme) => {
          const selected = preference === theme.id;
          return (
            <Pressable
              key={theme.id}
              accessibilityRole="button"
              accessibilityLabel={theme.label}
              accessibilityState={{ selected }}
              onPress={() => dispatch({ type: 'setTheme', theme: theme.id })}
              style={[
                styles.theme,
                {
                  backgroundColor: selected ? colors.accent : colors.elevated,
                  borderColor: selected ? colors.accent : colors.line,
                },
              ]}>
              <Text style={{ color: selected ? colors.accentInk : colors.ink, fontFamily: fonts.bodyMedium }}>{theme.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <SectionHeading title="On this device" />
      <Card>
        <Text style={[styles.body, { color: colors.ink, fontFamily: fonts.body }]}>
          {state.bots.length} {state.bots.length === 1 ? 'bot' : 'bots'} and {state.links.length}{' '}
          {state.links.length === 1 ? 'connection' : 'connections'}.
        </Text>
        <Text style={[styles.body, { color: colors.muted, fontFamily: fonts.body }]}>
          Bot Fleet stores this in the browser on this phone. Clearing site data, or uninstalling the home-screen app, deletes it.
        </Text>
      </Card>
      <SectionHeading title="Backup" />
      <Button
        label="Export JSON"
        onPress={() => {
          const json = serializeFleet(state, new Date().toISOString());
          setExported(json);
          const downloaded = downloadText(`bot-fleet-${new Date().toISOString().slice(0, 10)}.json`, json);
          setMessage(downloaded ? 'Backup downloaded.' : 'Backup ready to copy.');
        }}
      />
      {exported ? <Field label="Fleet JSON" value={exported} onChangeText={() => undefined} editable={false} multiline /> : null}
      <Field
        label="Fleet backup JSON"
        value={raw}
        onChangeText={setRaw}
        multiline
        hint="Paste a Bot Fleet backup. A bad file is rejected and the fleet stays as it is."
      />
      <Button label="Import JSON" onPress={() => requestImport(raw)} />
      {Platform.OS === 'web' ? (
        <Button
          label="Choose a JSON file"
          tone="secondary"
          onPress={() => {
            void pickTextFile().then((text) => {
              if (text) {
                setRaw(text);
                requestImport(text);
              }
            });
          }}
        />
      ) : null}
      <Notice message={message} />
      <SectionHeading title="Example fleet" />
      <Text style={[styles.body, { color: colors.muted, fontFamily: fonts.body }]}>
        Six fictional assistants, such as Job Scout and Study Coach. Useful the first time you open the app.
      </Text>
      <LoadExampleButton />
      <Button
        label="Clear fleet"
        tone="danger"
        onPress={() => {
          if (state.bots.length === 0) setMessage('The fleet is already empty.');
          else setClearOpen(true);
        }}
      />
      <Text style={[styles.version, { color: colors.muted, fontFamily: fonts.body }]}>Bot Fleet {version}</Text>
      <ConfirmDialog
        visible={pending !== null}
        title="Replace the fleet on this device?"
        message={pending ? `This imports ${pending.bots.length} bots and replaces what is stored here, including the theme saved in the file.` : ''}
        confirmLabel="Replace fleet"
        cancelLabel="Cancel"
        tone="primary"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) applyImport(pending);
        }}
      />
      <ConfirmDialog
        visible={clearOpen}
        title="Clear the fleet?"
        message="This deletes every bot, to-do, activity entry, and connection on this device. The theme stays."
        confirmLabel="Clear fleet"
        cancelLabel="Cancel"
        onCancel={() => setClearOpen(false)}
        onConfirm={() => {
          dispatch({ type: 'clearFleet' });
          setClearOpen(false);
          setMessage('Cleared the fleet on this device.');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  themes: { flexDirection: 'row', gap: 8 },
  theme: { flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  body: { fontSize: 15, lineHeight: 22 },
  version: { fontSize: 13, marginTop: 8 },
});
