import { render, screen } from '@testing-library/react';
import { EditTeamView } from '@/app/admin/equipos/editar/[id]/edit-team-view';
import { fetchTeamForEditAction } from '@/app/admin/equipos/(actions)/fetch-team-for-edit.action';
import { ROUTES } from '@/shared/constants/routes';
import { teamMock } from '../mocks/team.mock';

const mockRedirect = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error('NEXT_REDIRECT');
  },
}));

vi.mock('@/app/admin/equipos/(actions)/fetch-team-for-edit.action', () => ({
  fetchTeamForEditAction: vi.fn(),
}));

vi.mock('@/app/admin/equipos/editar/[id]/edit-team-form', () => ({
  EditTeamForm: ({ team }: { team: { name: string } }) => (
    <div data-testid="edit-team-form">{team.name}</div>
  ),
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/tournament-select-field', () => ({
  TournamentSelectField: () => <div data-testid="tournament-select-field" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/category-select-field', () => ({
  CategorySelectField: () => <div data-testid="category-select-field" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/coach-select-field', () => ({
  CoachSelectField: () => <div data-testid="coach-select-field" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/field-select-field', () => ({
  FieldSelectField: () => <div data-testid="field-select-field" />,
}));

describe('Tests on <EditTeamView />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Should render <EditTeamForm /> with the fetched team', async () => {
    vi.mocked(fetchTeamForEditAction).mockResolvedValue({
      ok: true,
      message: 'El equipo fue obtenido correctamente',
      team: teamMock,
    });

    const ServerComponent = await EditTeamView({
      paramsPromise: Promise.resolve({ id: teamMock.id }),
    });
    render(ServerComponent);

    const form = () => screen.getByTestId('edit-team-form');

    expect(form()).toHaveTextContent(teamMock.name);
    expect(fetchTeamForEditAction).toHaveBeenCalledWith({ teamId: teamMock.id });
  });

  test('Should redirect when the team cannot be fetched', async () => {
    vi.mocked(fetchTeamForEditAction).mockResolvedValue({
      ok: false,
      message: 'El equipo no existe con el id subministrado',
      team: null,
    });

    await expect(
      EditTeamView({ paramsPromise: Promise.resolve({ id: teamMock.id }) }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      `${ROUTES.ADMIN_TEAMS}?error=${encodeURIComponent(
        'El equipo no existe con el id subministrado',
      )}`,
    );
  });
});
