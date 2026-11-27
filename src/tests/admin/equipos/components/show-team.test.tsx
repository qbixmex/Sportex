import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ShowTeam } from '@/app/admin/equipos/(components)/show-team';
import { ROUTES } from '@/shared/constants/routes';

const teamId = '550e8400-e29b-41d4-a716-446655440001';

const renderComponent = () => {
  render(
    <TooltipProvider>
      <ShowTeam teamId={teamId} />
    </TooltipProvider>,
  );

  const user = userEvent.setup();
  const link = screen.getByRole('link', {
    name: 'Ver información del equipo',
  });

  return { user, link };
};

describe('Test on <ShowTeam /> component', () => {
  test('Should render the link with the show route', () => {
    const { link } = renderComponent();

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', ROUTES.ADMIN_TEAMS_SHOW(teamId));
  });

  test('Should render the icon', () => {
    renderComponent();

    const icon = screen.getByRole('img', {
      name: 'Icono de información',
    });

    expect(icon).toBeInTheDocument();
  });

  test('Should show the tooltip', async () => {
    const { user, link } = renderComponent();

    await user.hover(link);

    const tooltip = screen.getByRole('tooltip');

    expect(tooltip).toHaveTextContent(/detalles/i);
  });
});
