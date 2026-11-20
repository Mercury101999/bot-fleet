import { fireEvent, screen } from '@testing-library/react-native';

import MapScreen from '@/app/(tabs)/map';
import { exampleFleet } from '@/lib/example';

import { fleetRouter, renderWithStore } from './render';

describe('MapScreen', () => {
  beforeEach(() => {
    fleetRouter().push.mockClear();
  });

  test('lists connections and opens a bot from the map', async () => {
    const example = exampleFleet();
    await renderWithStore(<MapScreen />, { bots: example.bots, links: example.links });
    expect(screen.getByText('Job Scout → Code Partner')).toBeTruthy();
    expect(screen.getByText('Release Notes')).toBeTruthy();
    expect(screen.getByText('Inbox Triage')).toBeTruthy();
    expect(screen.getAllByText('resume projects').length).toBeGreaterThan(0);
    await fireEvent.press(screen.getAllByLabelText('Open Job Scout')[0]);
    expect(fleetRouter().push).toHaveBeenCalledWith({ pathname: '/bot', params: { id: 'job-scout' } });
  });

  test('records a new hand-off and rejects a duplicate', async () => {
    const example = exampleFleet();
    await renderWithStore(<MapScreen />, { bots: example.bots, links: example.links });
    await fireEvent.press(screen.getByLabelText('From bot'));
    await fireEvent.press(screen.getByLabelText('Choose Job Scout as from'));
    await fireEvent.press(screen.getByLabelText('To bot'));
    await fireEvent.press(screen.getByLabelText('Choose Research Desk as to'));
    await fireEvent.changeText(screen.getByLabelText('Connection label'), 'sources');
    await fireEvent.press(screen.getByLabelText('Add connection'));
    expect(screen.getByText('sources')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Add connection'));
    expect(screen.getByText('Those bots are already connected.')).toBeTruthy();
  });
});
