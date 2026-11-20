import { fireEvent, screen } from '@testing-library/react-native';

import SettingsScreen from '@/app/(tabs)/settings';
import { exampleFleet } from '@/lib/example';
import { serializeFleet } from '@/lib/transfer';

import { renderWithStore } from './render';

describe('SettingsScreen', () => {
  test('rejects invalid JSON and imports a valid backup', async () => {
    await renderWithStore(<SettingsScreen />);
    await fireEvent.changeText(screen.getByLabelText('Fleet backup JSON'), '{');
    await fireEvent.press(screen.getByLabelText('Import JSON'));
    expect(screen.getByText('That text is not valid JSON.')).toBeTruthy();

    const example = exampleFleet();
    const json = serializeFleet({ ...example, settings: { theme: 'system' } }, '2026-11-20T00:00:00.000Z');
    await fireEvent.changeText(screen.getByLabelText('Fleet backup JSON'), json);
    await fireEvent.press(screen.getByLabelText('Import JSON'));
    expect(screen.getByText('Imported 6 bots.')).toBeTruthy();
    expect(screen.getByText(/6 bots and 5 connections/)).toBeTruthy();
  });

  test('switches the theme and loads the example fleet', async () => {
    await renderWithStore(<SettingsScreen />);
    await fireEvent.press(screen.getByLabelText('Dark'));
    expect(screen.getByLabelText('Dark').props.accessibilityState.selected).toBe(true);
    await fireEvent.press(screen.getByLabelText('Load example fleet'));
    expect(screen.getByText(/6 bots and 5 connections/)).toBeTruthy();
  });
});
