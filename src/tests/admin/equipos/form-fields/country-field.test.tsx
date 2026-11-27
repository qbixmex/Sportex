import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CountryField } from '@/app/admin/equipos/(components)/form-fields/country-field';
import {
  FormValueDisplay,
  SetValue,
  TeamFormWrapper,
} from '../mocks/form-wrapper.mock';

const renderComponent = (extra?: ReactNode) => {
  render(
    <TeamFormWrapper defaultValues={{ country: '' }}>
      <CountryField />
      <FormValueDisplay name="country" />
      {extra}
    </TeamFormWrapper>,
  );

  const user = userEvent.setup();
  const input = screen.getByRole('textbox');

  return { user, input };
};

describe('Test on <CountryField />', () => {
  test('Should render the input', () => {
    const { input } = renderComponent();

    expect(input).toBeInTheDocument();
    expect(screen.getByText(/país/i)).toBeInTheDocument();
    expect(screen.getByText(/opcional/i)).toHaveClass('text-gray-500');
  });

  test('Should not show an error when it is empty', () => {
    renderComponent();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('Should show an error when it is too short', async () => {
    renderComponent(<SetValue name="country" value="me" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/mayor a 3 caracteres/i);
  });

  test('Should show an error when it is too long', async () => {
    renderComponent(<SetValue name="country" value={'x'.repeat(101)} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/menor a 100 caracteres/i);
  });

  test('Should not show an error with a valid value', async () => {
    renderComponent(<SetValue name="country" value="México" />);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  test('Should update the value when typing a value', async () => {
    const { user, input } = renderComponent();

    await user.type(input, 'México');

    const countryValue = screen.getByTestId('country-value');

    expect(countryValue).toHaveTextContent('México');
  });
});
