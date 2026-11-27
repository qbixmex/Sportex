import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CityField } from '@/app/admin/equipos/(components)/form-fields/city-field';
import {
  FormValueDisplay,
  SetValue,
  TeamFormWrapper,
} from '../mocks/form-wrapper.mock';

const renderComponent = (extra?: ReactNode) => {
  render(
    <TeamFormWrapper defaultValues={{ city: '' }}>
      <CityField />
      <FormValueDisplay name="city" />
      {extra}
    </TeamFormWrapper>,
  );

  const user = userEvent.setup();
  const input = screen.getByRole('textbox');

  return { user, input };
};

describe('Test on <CityField />', () => {
  test('Should render the input', () => {
    const { input } = renderComponent();

    expect(input).toBeInTheDocument();
    expect(screen.getByText(/ciudad/i)).toBeInTheDocument();
    expect(screen.getByText(/opcional/i)).toHaveClass('text-gray-500');
  });

  test('Should not show an error when it is empty', () => {
    renderComponent();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('Should show an error when it is too short', async () => {
    renderComponent(<SetValue name="city" value="GD" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/mayor a 3 caracteres/i);
  });

  test('Should show an error when it is too long', async () => {
    renderComponent(<SetValue name="city" value={'x'.repeat(101)} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/menor a 100 caracteres/i);
  });

  test('Should not show an error with a valid value', async () => {
    renderComponent(<SetValue name="city" value="Guadalajara" />);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  test('Should update the value when typing', async () => {
    const { user, input } = renderComponent(
      <SetValue name="city" value="Monterrey" />,
    );

    await user.clear(input);
    await user.type(input, 'Guadalajara');

    const cityValue = screen.getByTestId('city-value');

    expect(cityValue).toHaveTextContent('Guadalajara');
  });
});
