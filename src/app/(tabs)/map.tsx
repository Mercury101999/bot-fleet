import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConnectionForm } from '@/components/ConnectionForm';
import { TeamMap } from '@/components/TeamMap';
import { Button, ConfirmDialog, DisplayTitle, EmptyState, Screen, SectionHeading } from '@/components/ui';
import { useFleet } from '@/store/FleetStore';
import { fonts } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

export default function MapScreen() {
  const { state, dispatch } = useFleet();
  const { colors } = useAppTheme();
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const pending = state.links.find((link) => link.id === pendingId);
  const names = new Map(state.bots.map((bot) => [bot.id, bot.name]));

  return (
    <Screen>
      <DisplayTitle title="Team map" subtitle="Who hands work to whom. Tap a bot to open it. The list below is the same connections, in text." />
      {state.bots.length === 0 ? (
        <EmptyState title="Nothing to map" body="Add a couple of bots first. Then record a directed hand-off, like milestone updates or FYI.">
          <Button label="Add a bot" onPress={() => router.push('/edit')} />
        </EmptyState>
      ) : (
        <>
          <TeamMap bots={state.bots} links={state.links} onOpen={(id) => router.push({ pathname: '/bot', params: { id } })} />
          <SectionHeading title="Connections" detail={String(state.links.length)} />
          {state.links.length === 0 ? (
            <Text style={{ color: colors.muted, fontFamily: fonts.body }}>No hand-offs yet.</Text>
          ) : (
            state.links.map((link) => {
              const from = names.get(link.fromId) ?? 'Unknown bot';
              const to = names.get(link.toId) ?? 'Unknown bot';
              return (
                <View key={link.id} style={[styles.row, { backgroundColor: colors.elevated, borderColor: colors.line }]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${from} to ${to}${link.label ? `, ${link.label}` : ''}. Open ${from}`}
                    onPress={() => router.push({ pathname: '/bot', params: { id: link.fromId } })}
                    style={styles.rowCopy}>
                    <Text style={[styles.rowTitle, { color: colors.ink, fontFamily: fonts.bodyMedium }]}>
                      {from} → {to}
                    </Text>
                    <Text style={[styles.rowMeta, { color: colors.muted, fontFamily: fonts.body }]}>{link.label || 'No label'}</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove connection from ${from} to ${to}`}
                    onPress={() => setPendingId(link.id)}
                    style={styles.remove}>
                    <Text style={{ color: colors.danger, fontFamily: fonts.bodyMedium }}>Remove</Text>
                  </Pressable>
                </View>
              );
            })
          )}
          <SectionHeading title="Add a connection" />
          <ConnectionForm
            bots={state.bots}
            links={state.links}
            onAdd={(fromId, toId, label) => dispatch({ type: 'addLink', fromId, toId, label })}
          />
        </>
      )}
      <ConfirmDialog
        visible={pending !== undefined}
        title="Remove this connection?"
        message={pending ? `${names.get(pending.fromId) ?? 'A bot'} will no longer point at ${names.get(pending.toId) ?? 'the other bot'}.` : ''}
        confirmLabel="Remove connection"
        cancelLabel="Keep connection"
        onCancel={() => setPendingId(null)}
        onConfirm={() => {
          if (pending) dispatch({ type: 'deleteLink', id: pending.id });
          setPendingId(null);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { borderWidth: 1, borderRadius: 14, padding: 8, paddingLeft: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowCopy: { flex: 1, paddingVertical: 6, gap: 2 },
  rowTitle: { fontSize: 16 },
  rowMeta: { fontSize: 13 },
  remove: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 10 },
});
