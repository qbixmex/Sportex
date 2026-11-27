import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PermalinkField } from '@/app/admin/equipos/(components)/form-fields/permalink-field';
import {
  FormValueDisplay,
  SetValue,
  TeamFormWrapper,
} from '../mocks/form-wrapper.mock';

const renderComponent = (extra?: ReactNode, setPermalinkEdited = vi.fn()) => {
  render(
    <TeamFormWrapper>
      <PermalinkField setPermalinkEdited={setPermalinkEdited} />
      <FormValueDisplay name="permalink" />
      {extra}
    </TeamFormWrapper>,
  );

  const user = userEvent.setup();
  const input = screen.getByRole('textbox');

  return { user, input, setPermalinkEdited };
};

describe('Test on <PermalinkField />', () => {
  test('Should render the input', () => {
    const { input } = renderComponent();

    expect(input).toBeInTheDocument();
    expect(screen.getByText(/enlace permanente/i)).toBeInTheDocument();
  });

  test('Should show an error when permalink is not present', async () => {
    renderComponent(<SetValue name="permalink" value="" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/es obligatorio/i);
  });

  test('Should show an error when it is too short', async () => {
    renderComponent(<SetValue name="permalink" value="ab" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/mayor a 3 caracteres/i);
  });

  test('Should show an error when it is too long', async () => {
    renderComponent(<SetValue name="permalink" value={'a'.repeat(251)} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/menor a 250 caracteres/i);
  });

  test('Should show an error when it contains spaces', async () => {
    renderComponent(<SetValue name="permalink" value="con espacios" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/no debe contener espacios/i);
  });

  test('Should show an error when it contains accents', async () => {
    renderComponent(<SetValue name="permalink" value="águilas-fc" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/no debe contener acentos/i);
  });

  test('Should show an error when it contains special character', async () => {
    renderComponent(<SetValue name="permalink" value="aguilas-niños" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/no debe contener la letra ñ/i);
  });

  test('Should show an error when it contains invalid characters', async () => {
    renderComponent(<SetValue name="permalink" value="aguilas&fc" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/solo puede contener letras/i);
  });

  test('Should not show an error with a valid permalink', async () => {
    renderComponent(<SetValue name="permalink" value="aguilas-fc_2026" />);

    await waitFor(() => {
      const alert = screen.queryByRole('alert');
      expect(alert).toBeNull();
    });
  });

  test('Should update the value and mark the permalink as edited', async () => {
    const { user, input, setPermalinkEdited } = renderComponent();

    await user.clear(input);
    await user.type(input, 'shark-fc');

    await waitFor(() => {
      expect(screen.getByTestId('permalink-value'))
        .toHaveTextContent('shark-fc');
    });
    expect(setPermalinkEdited).toHaveBeenCalledWith(true);
  });
});
