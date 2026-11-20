import { fireEvent, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/(tabs)/index';
import { exampleFleet } from '@/lib/example';

import { renderWithStore } from './render';

describe('HomeScreen', () => {
  test('shows an empty state, then the example fleet', async () => {
    await renderWithStore(<HomeScreen />);
    expect(screen.getByText('No bots yet')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Load example fleet'));
    expect(screen.getByText("Draft this week's search brief")).toBeTruthy();
    expect(screen.getByText('Asked for a weekly search on help-desk roles.')).toBeTruthy();
  });

  test('summarizes the loaded fleet', async () => {
    const example = exampleFleet();
    await renderWithStore(<HomeScreen />, { bots: example.bots, links: example.links });
    expect(screen.getByText('6')).toBeTruthy();
    expect(screen.getByLabelText('Show Active bots, 3')).toBeTruthy();
    expect(screen.getByLabelText('Show Paused bots, 1')).toBeTruthy();
    expect(screen.getByText('Quiz on common ports')).toBeTruthy();
  });
});
