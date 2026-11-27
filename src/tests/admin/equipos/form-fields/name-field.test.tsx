import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NameField } from '@/app/admin/equipos/(components)/form-fields/name-field';
import {
  FormValueDisplay,
  SetValue,
  TeamFormWrapper,
} from '../mocks/form-wrapper.mock';

const renderComponent = (isPermalinkEdited = false, extra?: ReactNode) => {
  render(
    <TeamFormWrapper>
      <NameField isPermalinkEdited={isPermalinkEdited} />
      <FormValueDisplay name="name" />
      <FormValueDisplay name="permalink" />
      {extra}
    </TeamFormWrapper>,
  );

  const user = userEvent.setup();
  const input = screen.getByRole('textbox');

  return { user, input };
};

describe('Test on <NameField />', () => {
  test('Should render the input', () => {
    const { input } = renderComponent();

    expect(input).toBeInTheDocument();
    expect(screen.getByText(/nombre/i)).toBeInTheDocument();
  });

  test('Should show an error when the name is not sent', async () => {
    renderComponent(false, <SetValue name="name" value="" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/es obligatorio/i);
  });

  test('Should show an error when the name is too short', async () => {
    renderComponent(false, <SetValue name="name" value="ab" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/mayor a 3 caracteres/i);
  });

  test('Should show an error when the name is too long', async () => {
    renderComponent(false, <SetValue name="name" value={'x'.repeat(251)} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/menor a 250 caracteres/i);
  });

  test('Should show an error when the name is not a valid string', async () => {
    renderComponent(false, <SetValue name="name" value={5} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/debe ser una cadena de texto/i);
  });

  test('Should not show an error with a valid name', async () => {
    renderComponent(false, <SetValue name="name" value="Lobos" />);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  test('Should update the name and generate the permalink automatically', async () => {
    const { user, input } = renderComponent();

    await user.clear(input);
    await user.type(input, 'Sharks');

    await waitFor(() => {
      expect(screen.getByTestId('name-value')).toHaveTextContent('Sharks');
      expect(screen.getByTestId('permalink-value'))
        .toHaveTextContent('sharks');
    });
  });

  test('Should not overwrite the permalink when it was edited manually', async () => {
    render(
      <TeamFormWrapper defaultValues={{ permalink: 'dolphins-football-club' }}>
        <NameField isPermalinkEdited />
        <FormValueDisplay name="name" />
        <FormValueDisplay name="permalink" />
      </TeamFormWrapper>,
    );
    const user = userEvent.setup();
    const input = screen.getByRole('textbox');

    await user.clear(input);
    await user.type(input, 'Dolphins FC');

    await waitFor(() => {
      expect(screen.getByTestId('name-value')).toHaveTextContent('Dolphins FC');
      expect(screen.getByTestId('permalink-value'))
        .toHaveTextContent('dolphins-football-club');
    });
  });
});
