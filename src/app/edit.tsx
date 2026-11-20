import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';

import { BotForm } from '@/components/BotForm';
import { Button, EmptyState, StackScreen } from '@/components/ui';
import { draftFromBot, emptyDraft } from '@/lib/draft';
import { createId } from '@/lib/id';
import { useFleet } from '@/store/FleetStore';
import { fonts } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

export default function EditScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { state, dispatch } = useFleet();
  const { colors } = useAppTheme();
  const router = useRouter();
  const existing = id ? state.bots.find((bot) => bot.id === id) : undefined;

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace(id ? { pathname: '/bot', params: { id } } : '/bots');
  }

  return (
    <StackScreen title={existing ? 'Edit bot' : id ? 'Bot' : 'New bot'} onBack={goBack}>
      {id && !existing ? (
        <EmptyState title="That bot is not on this device" body="It may have been deleted.">
          <Button label="Back to bots" onPress={() => router.replace('/bots')} />
        </EmptyState>
      ) : (
        <>
          <Text accessibilityRole="header" style={{ color: colors.ink, fontFamily: fonts.display, fontSize: 28 }}>
            {existing ? `Edit ${existing.name}` : 'New bot'}
          </Text>
          <BotForm
            initial={existing ? draftFromBot(existing) : emptyDraft()}
            submitLabel={existing ? 'Save bot' : 'Add bot'}
            onCancel={goBack}
            onSubmit={(draft) => {
              if (existing) {
                dispatch({ type: 'updateBot', id: existing.id, draft });
                goBack();
                return;
              }
              const nextId = createId();
              dispatch({ type: 'createBot', id: nextId, draft });
              router.replace({ pathname: '/bot', params: { id: nextId } });
            }}
          />
        </>
      )}
    </StackScreen>
  );
}
