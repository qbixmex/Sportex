import { render, screen } from '@testing-library/react';
import { TournamentSelectField } from '@/app/admin/equipos/(components)/form-fields/tournament-select-field';
import { fetchTournamentsForTeam } from '@/app/admin/equipos/(actions)';
import { ROUTES } from '@/shared/constants/routes';

const mockRedirect = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error('NEXT_REDIRECT');
  },
}));

vi.mock('@/app/admin/equipos/(actions)', () => ({
  fetchTournamentsForTeam: vi.fn(),
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/tournament-select-field/tournaments-form-select', () => ({
  TournamentsFormSelect: ({ tournaments }: { tournaments: unknown[] }) => (
    <div data-testid="tournaments-form-select">{tournaments.length}</div>
  ),
}));

const tournaments = [
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    name: 'Torneo Verano',
    categories: [],
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440003',
    name: 'Torneo Invierno',
    categories: [],
  },
];

describe('Test on <TournamentSelectField />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Should render <TournamentsFormSelect /> with the tournaments', async () => {
    vi.mocked(fetchTournamentsForTeam).mockResolvedValue({
      ok: true,
      message: 'Torneos obtenidos correctamente',
      tournaments,
    });

    const ServerComponent = await TournamentSelectField({});
    render(ServerComponent);

    expect(screen.getByTestId('tournaments-form-select')).toHaveTextContent(
      String(tournaments.length),
    );
  });

  test('Should redirect when the fetch fails', async () => {
    vi.mocked(fetchTournamentsForTeam).mockResolvedValue({
      ok: false,
      message: 'Error al obtener los torneos',
      tournaments: [],
    });

    await expect(TournamentSelectField({})).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      `${ROUTES.ADMIN_TEAMS}?error=${encodeURIComponent(
        'Error al obtener los torneos',
      )}`,
    );
  });

  test('Should redirect when there are no tournaments', async () => {
    vi.mocked(fetchTournamentsForTeam).mockResolvedValue({
      ok: true,
      message: 'Torneos obtenidos correctamente',
      tournaments: [],
    });

    await expect(TournamentSelectField({})).rejects.toThrow('NEXT_REDIRECT');

    const errorMessage = 'No puedes crear un equipo sin torneos activos';
    expect(mockRedirect).toHaveBeenCalledWith(
      ROUTES.ADMIN_TEAMS +
      '?error=' +
      encodeURIComponent(errorMessage),
    );
  });
});
