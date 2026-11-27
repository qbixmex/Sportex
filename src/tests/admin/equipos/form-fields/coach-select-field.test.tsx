import { render, screen } from '@testing-library/react';
import { CoachSelectField } from '@/app/admin/equipos/(components)/form-fields/coach-select-field';
import { fetchCoachesForTeam } from '@/app/admin/equipos/(actions)/fetchCoachesForTeam';
import { ROUTES } from '@/shared/constants/routes';

const mockRedirect = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error('NEXT_REDIRECT');
  },
}));

vi.mock('@/app/admin/equipos/(actions)/fetchCoachesForTeam', () => ({
  fetchCoachesForTeam: vi.fn(),
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/coach-select-field/coaches-form-select', () => ({
  CoachesFormSelect: ({ coaches }: { coaches: unknown[] }) => (
    <div data-testid="coaches-form-select">{coaches.length}</div>
  ),
}));

const coaches = [
  { id: 'b7e2ca32-af95-4750-bf63-6a338b236097', name: 'Carlos Pérez' },
];

describe('Test on <CoachSelectField />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Should render <CoachesFormSelect /> with the coaches', async () => {
    vi.mocked(fetchCoachesForTeam).mockResolvedValue({
      ok: true,
      message: 'Entrenadores obtenidos correctamente',
      coaches,
    });

    const ServerComponent = await CoachSelectField({});
    render(ServerComponent);

    expect(screen.getByTestId('coaches-form-select')).toHaveTextContent(
      String(coaches.length),
    );
  });

  test('Should redirect when the fetch fails', async () => {
    vi.mocked(fetchCoachesForTeam).mockResolvedValue({
      ok: false,
      message: 'Error al obtener los entrenadores',
      coaches: [],
    });

    await expect(CoachSelectField({})).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      `${ROUTES.ADMIN_TEAMS}?error=${encodeURIComponent(
        'Error al obtener los entrenadores',
      )}`,
    );
  });

  test('Should redirect when there are no coaches', async () => {
    vi.mocked(fetchCoachesForTeam).mockResolvedValue({
      ok: true,
      message: 'Entrenadores obtenidos correctamente',
      coaches: [],
    });

    await expect(CoachSelectField({})).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      `${ROUTES.ADMIN_TEAMS}?error=${encodeURIComponent(
        'No puedes crear un equipo sin entrenadores activos',
      )}`,
    );
  });
});
