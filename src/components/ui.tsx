import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFleet } from '@/store/FleetStore';
import { fonts, type Palette } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

export function Screen({ children, inset = true }: { children: ReactNode; inset?: boolean }) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: inset ? insets.top : 0 }]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 16 }}>
        {children}
      </ScrollView>
    </View>
  );
}

export function StackScreen({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <StackBar title={title} onBack={onBack} />
      <Screen inset={false}>{children}</Screen>
    </View>
  );
}

export function StackBar({ title, onBack }: { title: string; onBack: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.stackBar, { borderBottomColor: colors.line }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.back} hitSlop={8}>
        <Text style={[styles.backLabel, { color: colors.accent, fontFamily: fonts.bodyMedium }]}>Back</Text>
      </Pressable>
      <Text accessibilityRole="header" numberOfLines={1} style={[styles.stackTitle, { color: colors.ink, fontFamily: fonts.bodyMedium }]}>
        {title}
      </Text>
    </View>
  );
}

export function DisplayTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.titleBlock}>
      <Text accessibilityRole="header" style={[styles.display, { color: colors.ink, fontFamily: fonts.displayBold }]}>
        {title}
      </Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.muted, fontFamily: fonts.body }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionHeading({ title, detail }: { title: string; detail?: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.sectionHeading}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.ink, fontFamily: fonts.bodyBold }]}>
        {title}
      </Text>
      {detail ? <Text style={[styles.sectionDetail, { color: colors.muted, fontFamily: fonts.body }]}>{detail}</Text> : null}
    </View>
  );
}

export function Button({
  label,
  onPress,
  tone = 'primary',
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'danger' | 'ghost';
  accessibilityLabel?: string;
}) {
  const { colors } = useAppTheme();
  const palette = buttonPalette(colors, tone);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, borderColor: palette.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      <Text style={[styles.buttonLabel, { color: palette.ink, fontFamily: fonts.bodyMedium }]}>{label}</Text>
    </Pressable>
  );
}

function buttonPalette(colors: Palette, tone: 'primary' | 'secondary' | 'danger' | 'ghost') {
  if (tone === 'primary') return { bg: colors.accent, ink: colors.accentInk, border: colors.accent };
  if (tone === 'danger') return { bg: colors.dangerSoft, ink: colors.danger, border: colors.dangerSoft };
  if (tone === 'ghost') return { bg: 'transparent', ink: colors.ink, border: 'transparent' };
  return { bg: colors.elevated, ink: colors.ink, border: colors.line };
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  hint,
  autoCapitalize,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  hint?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.ink, fontFamily: fonts.bodyMedium }]}>{label}</Text>
      {hint ? <Text style={[styles.hint, { color: colors.muted, fontFamily: fonts.body }]}>{hint}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        autoCapitalize={autoCapitalize ?? (multiline ? 'sentences' : 'none')}
        autoCorrect={multiline}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          {
            color: colors.ink,
            backgroundColor: colors.elevated,
            borderColor: colors.line,
            fontFamily: fonts.body,
          },
        ]}
      />
    </View>
  );
}

export function Chip({
  label,
  selected = false,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.accent : colors.elevated,
          borderColor: selected ? colors.accent : colors.line,
        },
      ]}>
      <Text style={{ color: selected ? colors.accentInk : colors.ink, fontFamily: fonts.bodyMedium, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.elevated, borderColor: colors.line, shadowColor: colors.shadow }, style]}>
      {children}
    </View>
  );
}

export function EmptyState({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <Card>
      <Text accessibilityRole="header" style={[styles.emptyTitle, { color: colors.ink, fontFamily: fonts.display }]}>
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: colors.muted, fontFamily: fonts.body }]}>{body}</Text>
      {children ? <View style={styles.emptyActions}>{children}</View> : null}
    </Card>
  );
}

export function Notice({ message }: { message: string }) {
  const { colors } = useAppTheme();
  if (!message) return null;
  return (
    <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={[styles.notice, { color: colors.ink, fontFamily: fonts.body }]}>
      {message}
    </Text>
  );
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View accessibilityViewIsModal style={[styles.dialogScrim, { backgroundColor: 'rgba(12, 18, 22, 0.46)' }]}>
        <View accessibilityRole="alert" style={[styles.dialog, { backgroundColor: colors.elevated, borderColor: colors.line }]}>
        <Text accessibilityRole="header" style={[styles.dialogTitle, { color: colors.ink, fontFamily: fonts.bodyBold }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted, fontFamily: fonts.body }]}>{message}</Text>
          <View style={styles.dialogActions}>
            <Button label={cancelLabel} tone="secondary" onPress={onCancel} />
            <Button label={confirmLabel} tone={tone === 'danger' ? 'danger' : 'primary'} onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function LoadExampleButton() {
  const { state, dispatch } = useFleet();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        label="Load example fleet"
        tone="secondary"
        onPress={() => {
          if (state.bots.length === 0) dispatch({ type: 'loadExample' });
          else setOpen(true);
        }}
      />
      <ConfirmDialog
        visible={open}
        title="Replace this fleet?"
        message="The example bots are fictional. Loading them replaces the bots and connections on this device. Your theme stays as it is."
        confirmLabel="Load example"
        cancelLabel="Cancel"
        tone="primary"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          dispatch({ type: 'loadExample' });
          setOpen(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  stackBar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  back: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  backLabel: { fontSize: 16 },
  stackTitle: { flex: 1, fontSize: 16 },
  titleBlock: { gap: 6 },
  display: { fontSize: 34, lineHeight: 40 },
  subtitle: { fontSize: 16, lineHeight: 23 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  sectionTitle: { fontSize: 18 },
  sectionDetail: { fontSize: 14 },
  button: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonLabel: { fontSize: 16 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 15 },
  hint: { fontSize: 13, lineHeight: 18 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputMultiline: { minHeight: 120, textAlignVertical: 'top' },
  chip: {
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  emptyTitle: { fontSize: 24, lineHeight: 30 },
  emptyActions: { gap: 10, marginTop: 8 },
  notice: { fontSize: 15, lineHeight: 21 },
  dialogScrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: { width: '100%', maxWidth: 420, borderWidth: 1, borderRadius: 16, padding: 18, gap: 12 },
  dialogTitle: { fontSize: 20 },
  dialogActions: { gap: 8 },
});
