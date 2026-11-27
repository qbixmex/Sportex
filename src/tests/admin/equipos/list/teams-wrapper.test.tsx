import { render, screen } from '@testing-library/react';
import { TeamsWrapper } from '@/app/admin/equipos/(components)/teams-wrapper';
import { fetchAdminTeamsAction } from '@/app/admin/equipos/(actions)/fetch-admin-teams.action';
import { getSession } from '@/lib/get-session';
import { teamsMock } from '../mocks/teams.mock';

vi.mock('@/lib/get-session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/app/admin/equipos/(actions)/fetch-admin-teams.action', () => ({
  fetchAdminTeamsAction: vi.fn(),
}));

vi.mock('@/app/admin/equipos/(components)/teams-table', () => ({
  TeamsTable: ({
    teams,
    pagination,
    roles,
  }: {
    teams: unknown[];
    pagination: { currentPage: number; totalPages: number };
    roles: string[];
  }) => (
    <div
      data-testid="teams-table"
      data-teams={teams.length}
      data-current-page={pagination.currentPage}
      data-total-pages={pagination.totalPages}
      data-roles={roles?.join(',')}
    />
  ),
}));

const tournamentId = '660e8400-e29b-41d4-a716-446655440002';
const categoryId = '770e8400-e29b-41d4-a716-446655440003';

describe('Tests on <TeamsWrapper />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue({
      user: { roles: ['admin'] },
    } as never);
    vi.mocked(fetchAdminTeamsAction).mockResolvedValue({
      ok: true,
      message: 'Los equipos fueron obtenidos correctamente',
      teams: teamsMock,
      pagination: { currentPage: 1, totalPages: 2 },
    });
  });

  test('Should fetch the teams with the expected options', async () => {
    const component = await TeamsWrapper({
      tournamentId,
      categoryId,
      currentPage: 1,
      query: 'colegio tepeyac',
    });
    render(component);

    expect(fetchAdminTeamsAction).toHaveBeenCalledWith(tournamentId, categoryId, {
      page: 1,
      take: 12,
      searchTerm: 'colegio tepeyac',
    });
  });

  test('Should pass the teams, pagination and roles to <TeamsTable />', async () => {
    vi.mocked(fetchAdminTeamsAction).mockResolvedValue({
      ok: true,
      message: 'Los equipos fueron obtenidos correctamente',
      teams: teamsMock,
      pagination: { currentPage: 2, totalPages: 2 },
    });
    const component = await TeamsWrapper({
      tournamentId,
      categoryId,
      currentPage: 2,
      query: '',
    });
    render(component);

    const table = screen.getByTestId('teams-table');

    expect(table).toHaveAttribute('data-teams', String(teamsMock.length));
    expect(table).toHaveAttribute('data-current-page', '2');
    expect(table).toHaveAttribute('data-total-pages', '2');
    expect(table).toHaveAttribute('data-roles', 'admin');
  });

  test('Should handle a null session', async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const component = await TeamsWrapper({
      tournamentId: '',
      categoryId: '',
      currentPage: 1,
      query: '',
    });
    render(component);

    expect(screen.getByTestId('teams-table')).toBeInTheDocument();
  });
});
