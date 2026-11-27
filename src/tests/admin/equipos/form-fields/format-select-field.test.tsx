import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormatSelectField } from '@/app/admin/equipos/(components)/form-fields/format-select-field';
import {
  FormValueDisplay,
  SetValue,
  TeamFormWrapper,
} from '../mocks/form-wrapper.mock';

const renderComponent = (extra?: ReactNode) => {
  render(
    <TeamFormWrapper defaultValues={{ format: '' }}>
      <FormatSelectField />
      <FormValueDisplay name="format" />
      {extra}
    </TeamFormWrapper>,
  );

  const user = userEvent.setup();
  const combobox = screen.getByRole('combobox');

  return { user, combobox };
};

describe('Test on <FormatSelectField />', () => {
  test('Should render the select', () => {
    const { combobox } = renderComponent();

    expect(combobox).toBeInTheDocument();
    expect(screen.getByText(/^formato/i)).toBeInTheDocument();
    expect(screen.getByText(/^\*$/i)).toHaveClass('text-orange-500');
    expect(screen.getByText(/seleccione formato/i)).toBeInTheDocument();
  });

  test('Should show the format options', async () => {
    const { user, combobox } = renderComponent();

    await user.click(combobox);

    await waitFor(() => {
      const elevenOption = screen.getByRole('option', { name: '11 vs 11' });
      const nineOption = screen.getByRole('option', { name: '9 vs 9' });
      const sevenOption = screen.getByRole('option', { name: '7 vs 7' });
      const fiveOption = screen.getByRole('option', { name: '5 vs 5' });

      expect(elevenOption).toHaveTextContent('11 vs 11');
      expect(nineOption).toHaveTextContent('9 vs 9');
      expect(sevenOption).toHaveTextContent('7 vs 7');
      expect(fiveOption).toHaveTextContent('5 vs 5');
    });
  });

  test('Should update the form value when selecting an option', async () => {
    const { user, combobox } = renderComponent();

    await user.click(combobox);
    const sevenOption = await screen.findByRole('option', { name: '7 vs 7' });
    await user.click(sevenOption);

    await waitFor(() => {
      expect(screen.getByTestId('format-value')).toHaveTextContent('7');
    });
  });

  test('Should show an error when the format is not a string', async () => {
    renderComponent(<SetValue name="format" value={7} />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/debe ser una cadena de texto/i);
  });

  test('Should show an error when the format is empty', async () => {
    renderComponent(<SetValue name="format" value="" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/es obligatorio/i);
  });

  test('Should show an error when the format is too long', async () => {
    renderComponent(<SetValue name="format" value={'9'.repeat(101)} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/debe ser menor a 100 caracteres/i);
  });

  test('Should not show an error with a valid format', async () => {
    renderComponent(<SetValue name="format" value="9" />);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
