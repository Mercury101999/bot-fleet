import { fireEvent, screen } from '@testing-library/react-native';

import BotsScreen from '@/app/(tabs)/bots';
import { exampleFleet } from '@/lib/example';

import { renderWithStore, setFleetParams } from './render';

describe('BotsScreen', () => {
  beforeEach(() => {
    setFleetParams({});
  });

  test('filters by search and status', async () => {
    const example = exampleFleet();
    await renderWithStore(<BotsScreen />, { bots: example.bots, links: example.links });

    await fireEvent.changeText(screen.getByLabelText('Search bots'), 'study');
    expect(screen.getByText('Study Coach')).toBeTruthy();
    expect(screen.queryByText('Job Scout')).toBeNull();

    await fireEvent.changeText(screen.getByLabelText('Search bots'), '');
    await fireEvent.press(screen.getByLabelText('Show Paused bots'));
    expect(screen.getByText('Inbox Triage')).toBeTruthy();
    expect(screen.queryByText('Study Coach')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Filter by tag research'));
    expect(screen.queryByText('Inbox Triage')).toBeNull();
  });

  test('opens on the status passed from home', async () => {
    setFleetParams({ status: 'idea' });
    const example = exampleFleet();
    await renderWithStore(<BotsScreen />, { bots: example.bots, links: example.links });
    expect(screen.getByText('Research Desk')).toBeTruthy();
    expect(screen.queryByText('Job Scout')).toBeNull();
    expect(screen.getByLabelText('Show Idea bots').props.accessibilityState.selected).toBe(true);
  });
});
