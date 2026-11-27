import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EditTeam } from '@/app/admin/equipos/(components)/edit-team';
import { ROUTES } from '@/shared/constants/routes';

const teamId = '550e8400-e29b-41d4-a716-446655440001';

const renderComponent = () => {
  render(
    <TooltipProvider>
      <EditTeam teamId={teamId} />
    </TooltipProvider>,
  );

  const user = userEvent.setup();
  const link = screen.getByRole('link');

  return { user, link };
};

describe('Test on <EditTeam /> component', () => {
  test('Should render the link with the edit route', () => {
    const { link } = renderComponent();

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', ROUTES.ADMIN_TEAM_EDIT(teamId));
  });

  test('Should render the icon', () => {
    renderComponent();

    const icon = screen.queryByRole('img', {
      name: 'Icono de lápiz',
    });

    expect(icon).toBeInTheDocument();
  });

  test('Should show the tooltip', async () => {
    const { user, link } = renderComponent();

    await user.hover(link);

    const tooltip = screen.getByRole('tooltip');

    expect(tooltip).toHaveTextContent(/editar/i);
  });
});
