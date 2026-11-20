import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { linkError } from '@/lib/selectors';
import type { Bot, Handoff } from '@/lib/types';
import { fonts } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

import { Button, Field, Notice } from '@/components/ui';

export function ConnectionForm({ bots, links, onAdd }: { bots: Bot[]; links: Handoff[]; onAdd: (fromId: string, toId: string, label: string) => void }) {
  const { colors } = useAppTheme();
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [label, setLabel] = useState('');
  const [open, setOpen] = useState<'from' | 'to' | null>(null);
  const [error, setError] = useState('');
  const from = bots.find((bot) => bot.id === fromId);
  const to = bots.find((bot) => bot.id === toId);

  if (bots.length < 2) {
    return <Text style={{ color: colors.muted, fontFamily: fonts.body }}>Add at least two bots before you connect them.</Text>;
  }

  return (
    <View style={styles.form}>
      <Choice
        label="From bot"
        value={from?.name ?? 'Choose a bot'}
        expanded={open === 'from'}
        options={bots}
        optionLabel={(bot) => `Choose ${bot.name} as from`}
        onToggle={() => setOpen(open === 'from' ? null : 'from')}
        onPick={(id) => {
          setFromId(id);
          setOpen(null);
        }}
      />
      <Choice
        label="To bot"
        value={to?.name ?? 'Choose a bot'}
        expanded={open === 'to'}
        options={bots}
        optionLabel={(bot) => `Choose ${bot.name} as to`}
        onToggle={() => setOpen(open === 'to' ? null : 'to')}
        onPick={(id) => {
          setToId(id);
          setOpen(null);
        }}
      />
      <Field label="Connection label" value={label} onChangeText={setLabel} placeholder="milestone updates" hint="Optional. For example, FYI or practice labs." />
      <Notice message={error} />
      <Button
        label="Add connection"
        onPress={() => {
          const next = linkError(links, fromId, toId);
          if (next) {
            setError(next);
            return;
          }
          onAdd(fromId, toId, label);
          setLabel('');
          setError('');
        }}
      />
    </View>
  );
}

function Choice({
  label,
  value,
  expanded,
  options,
  optionLabel,
  onToggle,
  onPick,
}: {
  label: string;
  value: string;
  expanded: boolean;
  options: Bot[];
  optionLabel: (bot: Bot) => string;
  onToggle: () => void;
  onPick: (id: string) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.choice}>
      <Text style={[styles.choiceLabel, { color: colors.ink, fontFamily: fonts.bodyMedium }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={[styles.choiceButton, { backgroundColor: colors.elevated, borderColor: colors.line }]}>
        <Text style={{ color: colors.ink, fontFamily: fonts.body, fontSize: 16 }}>{value}</Text>
      </Pressable>
      {expanded
        ? options.map((bot) => (
            <Pressable
              key={bot.id}
              accessibilityRole="button"
              accessibilityLabel={optionLabel(bot)}
              onPress={() => onPick(bot.id)}
              style={[styles.option, { borderColor: colors.line }]}>
              <Text style={{ color: colors.ink, fontFamily: fonts.body }}>
                {bot.emoji} {bot.name}
              </Text>
            </Pressable>
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  choice: { gap: 6 },
  choiceLabel: { fontSize: 15 },
  choiceButton: { minHeight: 48, borderWidth: 1, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 12 },
  option: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8, borderBottomWidth: 1 },
});
