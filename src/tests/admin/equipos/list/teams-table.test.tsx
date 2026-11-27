import { render, screen } from '@testing-library/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TeamsTable } from '@/app/admin/equipos/(components)/teams-table';
import { ROUTES } from '@/shared/constants/routes';
import { teamsMock } from '../mocks/teams.mock';
import type { TEAM_TYPE } from '@/app/admin/equipos/(actions)/fetch-admin-teams.action';

vi.mock('@/app/admin/equipos/(actions)', () => ({
  updateTeamStateAction: vi.fn(),
}));

vi.mock('@/app/admin/equipos/(components)/show-team', () => ({
  ShowTeam: ({ teamId }: { teamId: string; }) => (
    <div data-testid={`show-team-${teamId}`} />
  ),
}));

vi.mock('@/app/admin/equipos/(components)/edit-team', () => ({
  EditTeam: ({ teamId }: { teamId: string; }) => (
    <div data-testid={`edit-team-${teamId}`} />
  ),
}));

vi.mock('@/app/admin/equipos/(components)/delete-team', () => ({
  DeleteTeam: ({ teamId, roles }: { teamId: string; roles: string[] }) => (
    <button
      data-testid={`delete-team-${teamId}`}
      data-roles={roles.join(',')}
    />
  ),
}));

vi.mock('@/shared/components/active-switch', () => ({
  ActiveSwitch: ({
    resource,
  }: {
    resource: { id: string; state: boolean };
  }) => (
    <span
      data-testid={`active-switch-${resource.id}`}
      data-state={String(resource.state)}
    />
  ),
}));

vi.mock('@/shared/components/pagination', () => ({
  Pagination: () => <span data-testid="pagination" />,
}));

const defaultPagination = { currentPage: 1, totalPages: 1 };

const renderComponent = (
  teams = teamsMock,
  pagination = defaultPagination,
  roles = ['admin'],
) => {
  render(
    <TooltipProvider>
      <TeamsTable teams={teams} pagination={pagination} roles={roles} />
    </TooltipProvider>,
  );
};

describe('Tests on <TeamsTable /> component', () => {
  test('Should render the table headers', () => {
    renderComponent();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText(/imagen/i)).toBeInTheDocument();
    expect(screen.getByText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/formato/i)).toBeInTheDocument();
    expect(screen.getByText(/rama/i)).toBeInTheDocument();
    expect(screen.getByText(/entrenador/i)).toBeInTheDocument();
    expect(screen.getByText(/jugadores/i)).toBeInTheDocument();
    expect(screen.getByText(/activo/i)).toBeInTheDocument();
    expect(screen.getByText(/acciones/i)).toBeInTheDocument();
  });

  test('Should render the team names', () => {
    renderComponent();

    teamsMock.forEach((team) => {
      expect(screen.queryByText(team.name)).toBeInTheDocument();
    });
  });

  test('Should render the format badges', () => {
    renderComponent();

    teamsMock.forEach((team) => {
      expect(
        screen.queryByText(`${team.format} vs ${team.format}`),
      ).toBeInTheDocument();
    });
  });

  test('Should render the gender badges', () => {
    renderComponent();

    expect(screen.queryByText(/varonil/i)).toBeInTheDocument();
    expect(screen.queryByText(/femenil/i)).toBeInTheDocument();
  });

  test('Should render the coach link', () => {
    renderComponent();

    const coach = teamsMock[0].coach as TEAM_TYPE;
    const coachLink = screen.getByRole('link', { name: coach.name });

    expect(coachLink).toHaveAttribute('href', ROUTES.ADMIN_COACHES_SHOW(coach.id));
  });

  test('Should render the coach name', () => {
    renderComponent();

    const team = teamsMock[0] as TEAM_TYPE;
    const coachName = screen.getByTestId('coach-name');

    expect(coachName).toHaveTextContent(team.coach!.name);
  });

  test('Should render the coach fallback', () => {
    renderComponent();

    const fallBackBadge = screen.getByTestId('coach-badge');

    expect(fallBackBadge).toHaveTextContent(/no asignado/i);
  });

  test('Should render the players count', () => {
    renderComponent();

    teamsMock.forEach((team) => {
      expect(screen.getByText(String(team.playersCount))).toBeInTheDocument();
    });
  });

  test('Should render the image placeholder when there is no image', () => {
    renderComponent();

    const icon = screen.queryByRole('img', {
      name: `${teamsMock[0].name} icono`,
    });

    expect(icon).toBeInTheDocument();
  });

  test('Should render team image when is uploaded', () => {
    renderComponent();

    const teamImage = screen.getByRole('img', {
      name: `${teamsMock[1].name} picture`,
    });

    expect(teamImage).toBeInTheDocument();
  });

  test('Should render <ShowTeam /> for each team', () => {
    renderComponent();

    teamsMock.forEach((team) => {
      const showButton = screen.queryByTestId(`show-team-${team.id}`);

      expect(showButton).toBeInTheDocument();
    });
  });

  test('Should render <EditTeam /> for each team', () => {
    renderComponent();

    teamsMock.forEach((team) => {
      const editButton = screen.queryByTestId(`edit-team-${team.id}`);

      expect(editButton).toBeInTheDocument();
    });
  });

  test('Should render <DeleteTeam /> for each team with the roles', () => {
    renderComponent();

    teamsMock.forEach((team) => {
      const deleteButton = screen.getByTestId(`delete-team-${team.id}`);

      expect(deleteButton).toHaveAttribute('data-roles', 'admin');
    });
  });

  test('Should render <ActiveSwitch /> for each team', () => {
    renderComponent();

    teamsMock.forEach((team) => {
      const activeSwitch = screen.getByTestId(`active-switch-${team.id}`);

      expect(activeSwitch).toHaveAttribute('data-state', String(team.active));
    });
  });

  test('Should hide the pagination when there is only one page', () => {
    renderComponent(teamsMock, { currentPage: 1, totalPages: 1 });

    const wrapper = screen.getByTestId('pagination').closest('div');

    expect(wrapper).toHaveClass('hidden');
  });

  test('Should render the pagination when there are multiple pages', () => {
    renderComponent(teamsMock, { currentPage: 1, totalPages: 3 });

    const wrapper = screen.getByTestId('pagination').closest('div');

    expect(wrapper).not.toHaveClass('hidden');
  });

  test('Should render the empty state when there are no teams', () => {
    renderComponent([]);

    expect(screen.getByText(/no se encontraron equipos/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
