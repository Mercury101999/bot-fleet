import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, DisplayTitle, EmptyState, LoadExampleButton, Screen, SectionHeading } from '@/components/ui';
import { openTodos, recentActivity, statusCounts } from '@/lib/selectors';
import { formatWhen } from '@/lib/time';
import { STATUSES, STATUS_LABEL } from '@/lib/types';
import { useFleet } from '@/store/FleetStore';
import { fonts } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

export default function HomeScreen() {
  const { state } = useFleet();
  const { colors } = useAppTheme();
  const router = useRouter();
  const counts = statusCounts(state.bots);
  const todos = openTodos(state.bots);
  const activity = recentActivity(state.bots);
  const openCount = todos.length;

  return (
    <Screen>
      <DisplayTitle
        title="Bot Fleet"
        subtitle="A private roster of the assistants you run. Status, hand-offs, notes, and follow-ups stay on this device."
      />
      {state.bots.length === 0 ? (
        <EmptyState
          title="No bots yet"
          body="Add the assistants you run, or load a fictional example fleet to see the overview, the team map, and the to-do list.">
          <Button label="Add a bot" onPress={() => router.push('/edit')} />
          <LoadExampleButton />
        </EmptyState>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: colors.ink, fontFamily: fonts.displayBold }]}>{state.bots.length}</Text>
              <Text style={[styles.summaryLabel, { color: colors.muted, fontFamily: fonts.body }]}>{state.bots.length === 1 ? 'bot' : 'bots'}</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: colors.ink, fontFamily: fonts.displayBold }]}>{openCount}</Text>
              <Text style={[styles.summaryLabel, { color: colors.muted, fontFamily: fonts.body }]}>
                {openCount === 1 ? 'open to-do' : 'open to-dos'}
              </Text>
            </Card>
          </View>
          <View style={styles.statGrid}>
            {STATUSES.map((status) => (
              <View key={status} style={styles.statCell}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${STATUS_LABEL[status]} bots, ${counts[status]}`}
                  onPress={() => router.push({ pathname: '/bots', params: { status } })}
                  style={[styles.stat, { backgroundColor: colors.status[status].bg }]}>
                  <Text style={[styles.statCount, { color: colors.status[status].ink, fontFamily: fonts.displayBold }]}>{counts[status]}</Text>
                  <Text style={[styles.statLabel, { color: colors.status[status].ink, fontFamily: fonts.bodyMedium }]}>{STATUS_LABEL[status]}</Text>
                </Pressable>
              </View>
            ))}
          </View>
          <SectionHeading title="Open to-dos" detail={openCount === 0 ? 'None' : String(openCount)} />
          {todos.length === 0 ? (
            <Text style={{ color: colors.muted, fontFamily: fonts.body }}>Nothing open across the fleet.</Text>
          ) : (
            todos.map((item) => (
              <Pressable
                key={item.todo.id}
                accessibilityRole="button"
                accessibilityLabel={`${item.botName}, to-do ${item.todo.text}`}
                onPress={() => router.push({ pathname: '/bot', params: { id: item.botId } })}
                style={[styles.row, { backgroundColor: colors.elevated, borderColor: colors.line }]}>
                <Text style={[styles.rowTitle, { color: colors.ink, fontFamily: fonts.bodyMedium }]}>{item.todo.text}</Text>
                <Text style={[styles.rowMeta, { color: colors.muted, fontFamily: fonts.body }]}>{item.botName}</Text>
              </Pressable>
            ))
          )}
          <SectionHeading title="Recent activity" />
          {activity.length === 0 ? (
            <Text style={{ color: colors.muted, fontFamily: fonts.body }}>No activity yet. Open a bot and write down what you asked it.</Text>
          ) : (
            activity.map((item) => (
              <Pressable
                key={item.entry.id}
                accessibilityRole="button"
                accessibilityLabel={`${item.botName}, ${item.entry.text}`}
                onPress={() => router.push({ pathname: '/bot', params: { id: item.botId } })}
                style={[styles.row, { backgroundColor: colors.elevated, borderColor: colors.line }]}>
                <Text style={[styles.rowTitle, { color: colors.ink, fontFamily: fonts.bodyMedium }]}>{item.entry.text}</Text>
                <Text style={[styles.rowMeta, { color: colors.muted, fontFamily: fonts.body }]}>
                  {item.botName} · {formatWhen(item.entry.createdAt)}
                </Text>
              </Pressable>
            ))
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1 },
  summaryValue: { fontSize: 32, lineHeight: 36 },
  summaryLabel: { fontSize: 14 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  statCell: { width: '50%', padding: 6 },
  stat: { borderRadius: 14, padding: 14, minHeight: 84, justifyContent: 'center' },
  statCount: { fontSize: 28, lineHeight: 32 },
  statLabel: { fontSize: 14 },
  row: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 4 },
  rowTitle: { fontSize: 16, lineHeight: 22 },
  rowMeta: { fontSize: 13 },
});
