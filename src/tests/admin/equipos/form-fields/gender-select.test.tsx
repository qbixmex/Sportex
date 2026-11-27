import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenderSelect } from '@/app/admin/equipos/(components)/form-fields/gender-select';
import {
  FormValueDisplay,
  SetValue,
  TeamFormWrapper,
} from '../mocks/form-wrapper.mock';

const renderComponent = (extra?: ReactNode) => {
  render(
    <TeamFormWrapper defaultValues={{ gender: undefined }}>
      <GenderSelect />
      <FormValueDisplay name="gender" />
      {extra}
    </TeamFormWrapper>,
  );

  const user = userEvent.setup();
  const combobox = screen.getByRole('combobox');

  return { user, combobox };
};

describe('Test on <GenderSelect />', () => {
  test('Should render the select', () => {
    const { combobox } = renderComponent();

    expect(combobox).toBeInTheDocument();
    expect(screen.getByText(/^rama/i)).toBeInTheDocument();
    expect(screen.getByText(/^\*$/i)).toHaveClass('text-orange-500');
    expect(screen.getByText(/seleccione rama/i)).toBeInTheDocument();
  });

  test('Should show the gender options', async () => {
    const { user, combobox } = renderComponent();

    await user.click(combobox);

    await waitFor(() => {
      const maleOption = screen.queryByRole('option', { name: 'varonil' });
      const femaleOption = screen.getByRole('option', { name: 'femenil' });

      expect(maleOption).toBeInTheDocument();
      expect(femaleOption).toBeInTheDocument();
    });
  });

  test('Should update the form value when selecting a male option', async () => {
    const { user, combobox } = renderComponent();

    await user.click(combobox);
    const maleOption = screen.getByRole('option', { name: 'varonil' });
    await user.click(maleOption);

    await waitFor(() => {
      const genderValue = screen.getByTestId('gender-value');
      expect(genderValue).toHaveTextContent('male');
    });
  });

  test('Should update the form value when selecting a male option', async () => {
    const { user, combobox } = renderComponent();

    await user.click(combobox);
    const femaleOption = screen.getByRole('option', { name: 'femenil' });
    await user.click(femaleOption);

    await waitFor(() => {
      const genderValue = screen.getByTestId('gender-value');
      expect(genderValue).toHaveTextContent('female');
    });
  });

  test('Should show an error when no gender is selected', async () => {
    renderComponent(<SetValue name="gender" value="" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/género/i);
  });

  test('Should not show an error with a valid gender', async () => {
    renderComponent(<SetValue name="gender" value="male" />);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
