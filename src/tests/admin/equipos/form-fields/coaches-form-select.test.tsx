import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CoachesFormSelect } from '@/app/admin/equipos/(components)/form-fields/coach-select-field/coaches-form-select';
import { FormValueDisplay, TeamFormWrapper } from '../mocks/form-wrapper.mock';

const coaches = [
  { id: 'b7e2ca32-af95-4750-bf63-6a338b236097', name: 'Carlos Pérez' },
  { id: 'c8f3db43-bg06-5861-cg74-7b449c347108', name: 'Ana López' },
];

const renderComponent = () => {
  render(
    <TeamFormWrapper defaultValues={{ coachId: '' }}>
      <CoachesFormSelect coaches={coaches} />
      <FormValueDisplay name="coachId" />
    </TeamFormWrapper>,
  );

  const user = userEvent.setup();
  const combobox = screen.getByRole('combobox');

  return { user, combobox };
};

describe('Test on <CoachesFormSelect />', () => {
  test('Should render the select', () => {
    const { combobox } = renderComponent();

    expect(combobox).toBeInTheDocument();
    expect(screen.getByText(/^entrenador$/i)).toBeInTheDocument();
    expect(screen.getByText(/opcional/i)).toHaveClass('text-gray-500');
    expect(screen.getByText(/seleccione un entrenador/i)).toBeInTheDocument();
  });

  test('Should show "ninguno" option', async () => {
    const { user, combobox } = renderComponent();
    await user.click(combobox);
    const option = await screen.findByRole('option', { name: 'ninguno' });
    expect(option).toBeInTheDocument();
  });

  test('Should show the coaches options', async () => {
    const { user, combobox } = renderComponent();

    await user.click(combobox);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Carlos Pérez' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Ana López' })).toBeInTheDocument();
    });
  });

  test('Should update the form value when selecting a coach', async () => {
    const { user, combobox } = renderComponent();

    await user.click(combobox);
    const option = await screen.findByRole('option', { name: 'Ana López' });
    await user.click(option);

    await waitFor(() => {
      const secondCoach = coaches[1];
      expect(screen.getByTestId('coachId-value'))
        .toHaveTextContent(secondCoach.id);
    });
  });

  test('Should set "none" when selecting the "ninguno" option', async () => {
    const { user, combobox } = renderComponent();

    await user.click(combobox);
    const option = await screen.findByRole('option', { name: 'ninguno' });
    await user.click(option);

    await waitFor(() => {
      const coachValue = screen.getByTestId('coachId-value');
      expect(coachValue).toHaveTextContent('none');
    });
  });
});
