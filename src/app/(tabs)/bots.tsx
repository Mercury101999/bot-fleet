import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BotCard } from '@/components/BotCard';
import { Button, Chip, DisplayTitle, EmptyState, LoadExampleButton, Screen } from '@/components/ui';
import { collectTags, filterBots, type StatusFilter } from '@/lib/selectors';
import { STATUSES, STATUS_LABEL, type BotStatus } from '@/lib/types';
import { useFleet } from '@/store/FleetStore';
import { fonts } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

function isStatus(value: string | undefined): value is BotStatus {
  return STATUSES.some((status) => status === value);
}

export default function BotsScreen() {
  const params = useLocalSearchParams<{ status?: string }>();
  const { state } = useFleet();
  const { colors } = useAppTheme();
  const router = useRouter();
  const requested = isStatus(params.status) ? params.status : 'all';
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>(requested);
  const [requestKey, setRequestKey] = useState(requested);
  const [tag, setTag] = useState('all');
  if (requested !== requestKey) {
    setRequestKey(requested);
    setStatus(requested);
  }
  const tags = collectTags(state.bots);
  const visible = filterBots(state.bots, query, status, tag);

  return (
    <Screen>
      <DisplayTitle title="Bots" subtitle="Search the roster, or narrow it by status and tag." />
      <Button label="Add a bot" onPress={() => router.push('/edit')} />
      <TextInput
        accessibilityLabel="Search bots"
        value={query}
        onChangeText={setQuery}
        placeholder="Search name, role, notes, or tag"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.search, { color: colors.ink, backgroundColor: colors.elevated, borderColor: colors.line, fontFamily: fonts.body }]}
      />
      <View style={styles.filters}>
        <Chip label="All" selected={status === 'all'} accessibilityLabel="Show all bots" onPress={() => setStatus('all')} />
        {STATUSES.map((item) => (
          <Chip
            key={item}
            label={STATUS_LABEL[item]}
            selected={status === item}
            accessibilityLabel={`Show ${STATUS_LABEL[item]} bots`}
            onPress={() => setStatus(item)}
          />
        ))}
      </View>
      {tags.length > 0 ? (
        <View style={styles.filters}>
          <Chip label="All tags" selected={tag === 'all'} accessibilityLabel="Show all tags" onPress={() => setTag('all')} />
          {tags.map((item) => (
            <Chip
              key={item}
              label={item}
              selected={tag.toLocaleLowerCase() === item.toLocaleLowerCase()}
              accessibilityLabel={`Filter by tag ${item}`}
              onPress={() => setTag(item)}
            />
          ))}
        </View>
      ) : null}
      {state.bots.length === 0 ? (
        <EmptyState title="The roster is empty" body="Add a bot you actually run, or load the fictional example fleet.">
          <LoadExampleButton />
        </EmptyState>
      ) : visible.length === 0 ? (
        <Text style={{ color: colors.muted, fontFamily: fonts.body, fontSize: 16 }}>No bots match that search.</Text>
      ) : (
        visible.map((bot) => <BotCard key={bot.id} bot={bot} onPress={() => router.push({ pathname: '/bot', params: { id: bot.id } })} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, fontSize: 16 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
