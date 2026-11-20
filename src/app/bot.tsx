import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BotAvatar, StatusPill } from '@/components/BotCard';
import { Button, ConfirmDialog, EmptyState, Field, Notice, SectionHeading, StackScreen } from '@/components/ui';
import { orderedTodos } from '@/lib/selectors';
import { formatWhen } from '@/lib/time';
import { STATUSES, STATUS_LABEL } from '@/lib/types';
import { useFleet } from '@/store/FleetStore';
import { fonts } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

export default function BotScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { state, dispatch } = useFleet();
  const { colors } = useAppTheme();
  const router = useRouter();
  const bot = state.bots.find((item) => item.id === id);
  const [todo, setTodo] = useState('');
  const [activity, setActivity] = useState('');
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/bots');
  }

  if (!bot) {
    return (
      <StackScreen title="Bot" onBack={goBack}>
        <EmptyState title="That bot is not on this device" body="It may have been deleted, or this link does not match a saved bot.">
          <Button label="Back to bots" onPress={() => router.replace('/bots')} />
        </EmptyState>
      </StackScreen>
    );
  }

  const incoming = state.links.filter((link) => link.toId === bot.id);
  const outgoing = state.links.filter((link) => link.fromId === bot.id);
  const names = new Map(state.bots.map((item) => [item.id, item.name]));

  return (
    <>
      <StackScreen title={bot.name} onBack={goBack}>
        <View style={styles.hero}>
          <BotAvatar bot={bot} size={72} />
          <View style={styles.heroCopy}>
            <Text accessibilityRole="header" style={[styles.name, { color: colors.ink, fontFamily: fonts.displayBold }]}>
              {bot.name}
            </Text>
            <Text style={[styles.role, { color: colors.muted, fontFamily: fonts.body }]}>{bot.role || 'No role yet'}</Text>
            <StatusPill status={bot.status} />
          </View>
        </View>
        <View style={styles.wrap}>
          {STATUSES.map((status) => {
            const selected = bot.status === status;
            return (
              <Pressable
                key={status}
                accessibilityRole="button"
                accessibilityLabel={`Mark ${STATUS_LABEL[status]}`}
                accessibilityState={{ selected }}
                onPress={() => dispatch({ type: 'setStatus', id: bot.id, status })}
                style={[
                  styles.status,
                  {
                    backgroundColor: selected ? colors.status[status].bg : colors.elevated,
                    borderColor: selected ? colors.status[status].ink : colors.line,
                  },
                ]}>
                <Text style={{ color: selected ? colors.status[status].ink : colors.ink, fontFamily: fonts.bodyMedium }}>{STATUS_LABEL[status]}</Text>
              </Pressable>
            );
          })}
        </View>
        {bot.tags.length > 0 ? (
          <Text style={[styles.tags, { color: colors.accentSoftInk, fontFamily: fonts.bodyMedium }]}>{bot.tags.join(' · ')}</Text>
        ) : null}
        {bot.link ? (
          <Button label="Open link" accessibilityLabel={`Open link ${bot.link}`} tone="secondary" onPress={() => void Linking.openURL(bot.link)} />
        ) : null}
        <SectionHeading title="Notes" />
        <Text style={[styles.notes, { color: bot.notes ? colors.ink : colors.muted, fontFamily: fonts.body }]}>
          {bot.notes || 'No notes yet.'}
        </Text>
        <SectionHeading title="To-dos" />
        {orderedTodos(bot.todos).map((item) => (
          <View key={item.id} style={[styles.todo, { borderColor: colors.line }]}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel={item.text}
              accessibilityState={{ checked: item.done }}
              onPress={() => dispatch({ type: 'toggleTodo', botId: bot.id, todoId: item.id })}
              style={styles.todoMain}>
              <View style={[styles.box, { borderColor: colors.accent, backgroundColor: item.done ? colors.accent : 'transparent' }]}>
                {item.done ? <Text style={{ color: colors.accentInk, fontSize: 13 }}>✓</Text> : null}
              </View>
              <Text style={[styles.todoText, { color: colors.ink, fontFamily: fonts.body, textDecorationLine: item.done ? 'line-through' : 'none' }]}>
                {item.text}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Delete to-do ${item.text}`}
              onPress={() => dispatch({ type: 'deleteTodo', botId: bot.id, todoId: item.id })}
              style={styles.smallButton}>
              <Text style={{ color: colors.danger, fontFamily: fonts.bodyMedium }}>Delete</Text>
            </Pressable>
          </View>
        ))}
        <Field label="New to-do" value={todo} onChangeText={setTodo} placeholder="What should happen next" autoCapitalize="sentences" />
        <Button
          label="Add to-do"
          onPress={() => {
            if (!todo.trim()) {
              setMessage('Write a to-do first.');
              return;
            }
            dispatch({ type: 'addTodo', botId: bot.id, text: todo });
            setTodo('');
            setMessage('');
          }}
        />
        <SectionHeading title="Activity" />
        {bot.activity.length === 0 ? <Text style={{ color: colors.muted, fontFamily: fonts.body }}>No activity yet.</Text> : null}
        {bot.activity.map((entry) => (
          <View key={entry.id} style={[styles.activity, { backgroundColor: colors.elevated, borderColor: colors.line }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.todoText, { color: colors.ink, fontFamily: fonts.body }]}>{entry.text}</Text>
              <Text style={{ color: colors.muted, fontFamily: fonts.body, fontSize: 13 }}>{formatWhen(entry.createdAt)}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Delete activity ${entry.text}`}
              onPress={() => dispatch({ type: 'deleteActivity', botId: bot.id, activityId: entry.id })}
              style={styles.smallButton}>
              <Text style={{ color: colors.danger, fontFamily: fonts.bodyMedium }}>Delete</Text>
            </Pressable>
          </View>
        ))}
        <Field label="Activity note" value={activity} onChangeText={setActivity} placeholder="What you asked, or what it did" multiline />
        <Button
          label="Add activity"
          onPress={() => {
            if (!activity.trim()) {
              setMessage('Write an activity note first.');
              return;
            }
            dispatch({ type: 'addActivity', botId: bot.id, text: activity });
            setActivity('');
            setMessage('');
          }}
        />
        <SectionHeading title="Connections" />
        {outgoing.length === 0 && incoming.length === 0 ? (
          <Text style={{ color: colors.muted, fontFamily: fonts.body }}>This bot has no hand-offs yet. Add them on the map.</Text>
        ) : null}
        {outgoing.map((link) => (
          <Text key={link.id} style={[styles.connection, { color: colors.ink, fontFamily: fonts.body }]}>
            Hands off to {names.get(link.toId) ?? 'a removed bot'}
            {link.label ? ` · ${link.label}` : ''}
          </Text>
        ))}
        {incoming.map((link) => (
          <Text key={link.id} style={[styles.connection, { color: colors.ink, fontFamily: fonts.body }]}>
            Hears from {names.get(link.fromId) ?? 'a removed bot'}
            {link.label ? ` · ${link.label}` : ''}
          </Text>
        ))}
        <Notice message={message} />
        <Button label="Edit bot" tone="secondary" onPress={() => router.push({ pathname: '/edit', params: { id: bot.id } })} />
        <Button label={`Delete ${bot.name}`} tone="danger" onPress={() => setConfirmDelete(true)} />
      </StackScreen>
      <ConfirmDialog
        visible={confirmDelete}
        title={`Delete ${bot.name}?`}
        message="This removes the bot, its to-dos, its activity, and any connections."
        confirmLabel="Delete bot"
        cancelLabel="Keep bot"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          dispatch({ type: 'deleteBot', id: bot.id });
          setConfirmDelete(false);
          goBack();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  heroCopy: { flex: 1, gap: 4 },
  name: { fontSize: 28, lineHeight: 34 },
  role: { fontSize: 16, lineHeight: 22 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  status: { minHeight: 40, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  tags: { fontSize: 14 },
  notes: { fontSize: 16, lineHeight: 23 },
  todo: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, paddingVertical: 4 },
  todoMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  todoText: { flex: 1, fontSize: 16, lineHeight: 22 },
  smallButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 6 },
  activity: { borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
  connection: { fontSize: 15, lineHeight: 22 },
});
