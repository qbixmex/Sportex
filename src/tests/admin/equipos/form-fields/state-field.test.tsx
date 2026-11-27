import { act, type ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { StateField } from '@/app/admin/equipos/(components)/form-fields/state-field';
import userEvent from '@testing-library/user-event';
import {
  FormValueDisplay,
  SetValue,
  TeamFormWrapper,
} from '../mocks/form-wrapper.mock';

const renderComponent = (extra?: ReactNode) => {
  render(
    <TeamFormWrapper defaultValues={{ state: '' }}>
      <StateField />
      <FormValueDisplay name="state" />
      {extra}
    </TeamFormWrapper>,
  );

  const user = userEvent.setup();
  const input = screen.getByRole('textbox');

  return { user, input };
};

describe('Test on <StateField />', () => {
  test('Should render the input', () => {
    const { input } = renderComponent();

    expect(input).toBeInTheDocument();
    expect(screen.getByText(/estado/i)).toBeInTheDocument();
    expect(screen.getByText(/opcional/i)).toHaveClass('text-gray-500');
  });

  test('Should not show an error when it is empty', () => {
    renderComponent();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('Should show an error when it is too short', async () => {
    renderComponent(<SetValue name="state" value="JA" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/mayor a 3 caracteres/i);
  });

  test('Should show an error when it is too long', async () => {
    renderComponent(<SetValue name="state" value={'x'.repeat(101)} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/menor a 100 caracteres/i);
  });

  test('Should not show an error with a valid value', async () => {
    renderComponent(<SetValue name="state" value="Michoacan" />);

    await waitFor(() => {
      const alert = screen.queryByRole('alert');
      expect(alert).not.toBeInTheDocument();
    });
  });

  test('Should update the value when typing', async () => {
    const testState = 'Nuevo Leon';
    const { user, input } = renderComponent(
      <SetValue name="state" value="Colima" />,
    );

    await user.clear(input);
    await user.type(input, testState);

    const stateValue = screen.getByTestId('state-value');
    expect(stateValue).toHaveTextContent(testState);
  });
});
