import { fireEvent, screen } from '@testing-library/react-native';

import BotScreen from '@/app/bot';
import { exampleFleet } from '@/lib/example';

import { fleetRouter, renderWithStore, setFleetParams } from './render';

describe('BotScreen', () => {
  beforeEach(() => {
    setFleetParams({ id: 'job-scout' });
    fleetRouter().back.mockClear();
    fleetRouter().push.mockClear();
  });

  test('checks a to-do and records activity', async () => {
    const example = exampleFleet();
    await renderWithStore(<BotScreen />, { bots: example.bots, links: example.links });

    const todo = screen.getByLabelText("Draft this week's search brief");
    expect(todo.props.accessibilityState.checked).toBe(false);
    await fireEvent.press(todo);
    expect(screen.getByLabelText("Draft this week's search brief").props.accessibilityState.checked).toBe(true);

    await fireEvent.changeText(screen.getByLabelText('Activity note'), 'Ping the scout');
    await fireEvent.press(screen.getByLabelText('Add activity'));
    expect(screen.getByText('Ping the scout')).toBeTruthy();
    expect(screen.getByText('Hands off to Code Partner · resume projects')).toBeTruthy();
  });

  test('asks before deleting the bot', async () => {
    const example = exampleFleet();
    await renderWithStore(<BotScreen />, { bots: example.bots, links: example.links });
    await fireEvent.press(screen.getByLabelText('Delete Job Scout'));
    expect(screen.getByText('Delete Job Scout?')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Delete bot'));
    expect(screen.getByText('That bot is not on this device')).toBeTruthy();
    expect(fleetRouter().back).toHaveBeenCalled();
  });
});
