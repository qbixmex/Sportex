import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddressTextArea } from '@/app/admin/equipos/(components)/form-fields/address-text-area';
import {
  FormValueDisplay,
  SetValue,
  TeamFormWrapper,
} from '../mocks/form-wrapper.mock';

const renderComponent = (extra?: ReactNode) => {
  render(
    <TeamFormWrapper defaultValues={{ address: '' }}>
      <AddressTextArea />
      <FormValueDisplay name="address" />
      {extra}
    </TeamFormWrapper>,
  );

  const user = userEvent.setup();
  const textarea = screen.getByRole('textbox');

  return { user, textarea };
};

describe('Test on <AddressTextArea />', () => {
  test('Should render the textarea', () => {
    const { textarea } = renderComponent();

    expect(screen.getByText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByText(/opcional/i)).toHaveClass('text-gray-500');
    expect(textarea).toBeInTheDocument();
  });

  test('Should not show an error when it is empty', () => {
    renderComponent();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('Should show an error when it is too short', async () => {
    renderComponent(<SetValue name="address" value={'a'.repeat(5)} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/mayor a 10 caracteres/i);
  });

  test('Should show an error when it is too long', async () => {
    renderComponent(<SetValue name="address" value={'x'.repeat(251)} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/menor a 250 caracteres/i);
  });

  test('Should not show an error with a valid value', async () => {
    const { user, textarea } = renderComponent(
      <SetValue name="address" value="Avenida" />,
    );

    await user.clear(textarea);
    await user.type(textarea, ' siempre viva');

    await waitFor(() => {
      const alert = screen.queryByRole('alert');
      expect(alert).not.toBeNull();
    });
  });

  test('Should update the value when typing a valid value', async () => {
    const testAddress = 'Avenida 16 de Septiembre';
    const { user, textarea } = renderComponent();

    await user.type(textarea, testAddress);

    expect(screen.getByTestId('address-value'))
      .toHaveTextContent(testAddress);
  });
});
