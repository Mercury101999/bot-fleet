import { Pressable, StyleSheet, Text, View } from 'react-native';

import { STATUS_LABEL, type Bot } from '@/lib/types';
import { fonts } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

export function BotAvatar({ bot, size = 48 }: { bot: Pick<Bot, 'emoji' | 'color'>; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bot.color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ fontSize: size * 0.46 }}>{bot.emoji}</Text>
    </View>
  );
}

export function StatusPill({ status }: { status: Bot['status'] }) {
  const { colors } = useAppTheme();
  const tone = colors.status[status];
  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }]}>
      <Text style={{ color: tone.ink, fontFamily: fonts.bodyMedium, fontSize: 13 }}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

export function BotCard({ bot, onPress }: { bot: Bot; onPress: () => void }) {
  const { colors } = useAppTheme();
  const open = bot.todos.filter((todo) => !todo.done).length;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${bot.name}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.elevated, borderColor: colors.line, opacity: pressed ? 0.92 : bot.status === 'retired' ? 0.8 : 1 },
      ]}>
      <BotAvatar bot={bot} />
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={[styles.name, { color: colors.ink, fontFamily: fonts.bodyBold }]}>
            {bot.name}
          </Text>
          <StatusPill status={bot.status} />
        </View>
        <Text numberOfLines={2} style={[styles.role, { color: colors.muted, fontFamily: fonts.body }]}>
          {bot.role || 'No role yet'}
        </Text>
        {bot.tags.length > 0 ? (
          <Text numberOfLines={1} style={[styles.tags, { color: colors.accentSoftInk, fontFamily: fonts.bodyMedium }]}>
            {bot.tags.join(' · ')}
          </Text>
        ) : null}
        {open > 0 ? (
          <Text style={[styles.open, { color: colors.ink, fontFamily: fonts.body }]}>
            {open === 1 ? '1 open to-do' : `${open} open to-dos`}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  copy: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: 17 },
  role: { fontSize: 14, lineHeight: 20 },
  tags: { fontSize: 13 },
  open: { fontSize: 13, marginTop: 2 },
  pill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
});
