import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TournamentsFormSelect } from '@/app/admin/equipos/(components)/form-fields/tournament-select-field/tournaments-form-select';
import { FormValueDisplay, TeamFormWrapper } from '../mocks/form-wrapper.mock';

const tournaments = [
  { id: '660e8400-e29b-41d4-a716-446655440002', name: 'Torneo Jóvenes Promesas' },
  { id: '660e8400-e29b-41d4-a716-446655440003', name: 'Torneo Estrellas del Mañana' },
];

const renderComponent = () => {
  render(
    <TeamFormWrapper defaultValues={{ tournamentId: '' }}>
      <TournamentsFormSelect tournaments={tournaments} />
      <FormValueDisplay name="tournamentId" />
    </TeamFormWrapper>,
  );

  const user = userEvent.setup();
  const combobox = screen.getByRole('combobox');

  return { user, combobox };
};

describe('Test on <TournamentsFormSelect />', () => {
  test('Should render the select', () => {
    const { combobox } = renderComponent();

    expect(combobox).toBeInTheDocument();
    expect(screen.getByText(/^torneo/i)).toBeInTheDocument();
    expect(screen.getByText(/^\*$/i)).toHaveClass('text-orange-500');
    expect(screen.getByText(/seleccione una torneo/i)).toBeInTheDocument();
  });

  test('Should show the tournament options', async () => {
    const { user, combobox } = renderComponent();

    await user.click(combobox);

    await waitFor(() => {
      const firstOption = screen.queryByRole('option', { name: tournaments[0].name });
      const secondOption = screen.queryByRole('option', { name: tournaments[1].name });
      expect(firstOption).toBeInTheDocument();
      expect(secondOption).toBeInTheDocument();
    });
  });

  test('Should update the form value when selecting a tournament', async () => {
    const { user, combobox } = renderComponent();

    await user.click(combobox);
    await user.click(await screen.findByRole('option', { name: tournaments[1].name }));

    await waitFor(() => {
      const tournamentValue = screen.getByTestId('tournamentId-value');
      expect(tournamentValue).toHaveTextContent(tournaments[1].id);
    });
  });
});
