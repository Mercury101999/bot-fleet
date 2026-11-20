import { fireEvent, screen } from '@testing-library/react-native';

import EditScreen from '@/app/edit';

import { fleetRouter, renderWithStore, setFleetParams } from './render';

describe('EditScreen', () => {
  beforeEach(() => {
    setFleetParams({});
    fleetRouter().replace.mockClear();
    fleetRouter().back.mockClear();
  });

  test('requires a name, then saves a new bot', async () => {
    await renderWithStore(<EditScreen />);
    await fireEvent.press(screen.getByLabelText('Add bot'));
    expect(screen.getByText('Name is required.')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Name'), 'Lab Partner');
    await fireEvent.changeText(screen.getByLabelText('Role'), 'Explains a practice lab');
    await fireEvent.press(screen.getByLabelText('Add bot'));
    expect(fleetRouter().replace).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/bot', params: expect.objectContaining({ id: expect.any(String) }) }),
    );
  });

  test('rejects a link that is not a URL', async () => {
    await renderWithStore(<EditScreen />);
    await fireEvent.changeText(screen.getByLabelText('Name'), 'Lab Partner');
    await fireEvent.changeText(screen.getByLabelText('Link'), 'not a url');
    await fireEvent.press(screen.getByLabelText('Add bot'));
    expect(screen.getByText('Link should be an http or https URL.')).toBeTruthy();
    expect(fleetRouter().replace).not.toHaveBeenCalled();
  });
});
