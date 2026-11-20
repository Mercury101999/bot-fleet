import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BOT_COLORS, EMOJI_CHOICES } from '@/lib/constants';
import { validateDraft } from '@/lib/draft';
import { STATUSES, STATUS_LABEL, type BotDraft, type BotStatus } from '@/lib/types';
import { fonts } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

import { Button, Chip, Field, Notice } from '@/components/ui';

export function BotForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: BotDraft;
  submitLabel: string;
  onSubmit: (draft: BotDraft) => void;
  onCancel: () => void;
}) {
  const { colors } = useAppTheme();
  const [draft, setDraft] = useState<BotDraft>(initial);
  const [error, setError] = useState('');

  function update(patch: Partial<BotDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  return (
    <View style={styles.form}>
      <Field label="Name" value={draft.name} onChangeText={(name) => update({ name })} placeholder="Job Scout" autoCapitalize="words" />
      <Field
        label="Role"
        value={draft.role}
        onChangeText={(role) => update({ role })}
        placeholder="What this assistant is for"
        autoCapitalize="sentences"
      />
      <View style={styles.block}>
        <Text style={[styles.label, { color: colors.ink, fontFamily: fonts.bodyMedium }]}>Emoji</Text>
        <View style={styles.wrap}>
          {EMOJI_CHOICES.map((emoji) => (
            <Pressable
              key={emoji}
              accessibilityRole="button"
              accessibilityLabel={`Emoji ${emoji}`}
              accessibilityState={{ selected: draft.emoji === emoji }}
              onPress={() => update({ emoji })}
              style={[
                styles.emoji,
                { borderColor: draft.emoji === emoji ? colors.accent : colors.line, backgroundColor: colors.elevated },
              ]}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
        <Field label="Custom emoji" value={draft.emoji} onChangeText={(emoji) => update({ emoji })} />
      </View>
      <View style={styles.block}>
        <Text style={[styles.label, { color: colors.ink, fontFamily: fonts.bodyMedium }]}>Color</Text>
        <View style={styles.wrap}>
          {BOT_COLORS.map((swatch) => {
            const hex = swatch.value;
            const selected = draft.color.toLowerCase() === hex.toLowerCase();
            return (
              <Pressable
                key={hex}
                accessibilityRole="button"
                accessibilityLabel={`Color ${swatch.name}`}
                accessibilityState={{ selected }}
                onPress={() => update({ color: hex })}
                style={[styles.swatch, { backgroundColor: hex, borderColor: selected ? colors.ink : 'transparent' }]}
              />
            );
          })}
        </View>
      </View>
      <View style={styles.block}>
        <Text style={[styles.label, { color: colors.ink, fontFamily: fonts.bodyMedium }]}>Status</Text>
        <View style={styles.wrap}>
          {STATUSES.map((status) => (
            <Chip
              key={status}
              label={STATUS_LABEL[status]}
              selected={draft.status === status}
              accessibilityLabel={`Status ${STATUS_LABEL[status]}`}
              onPress={() => update({ status: status satisfies BotStatus })}
            />
          ))}
        </View>
      </View>
      <Field label="Tags" value={draft.tags} onChangeText={(tags) => update({ tags })} placeholder="career, research" hint="Separate tags with commas." />
      <Field label="Link" value={draft.link} onChangeText={(link) => update({ link })} placeholder="https://example.com" hint="Optional. http or https." />
      <Field label="Notes" value={draft.notes} onChangeText={(notes) => update({ notes })} multiline placeholder="How you use this assistant" />
      <Notice message={error} />
      <Button
        label={submitLabel}
        onPress={() => {
          const next = validateDraft(draft);
          if (next) {
            setError(next);
            return;
          }
          setError('');
          onSubmit(draft);
        }}
      />
      <Button label="Cancel" tone="ghost" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  block: { gap: 8 },
  label: { fontSize: 15 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emoji: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 22 },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
});
