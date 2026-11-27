import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CreateTeam } from '@/app/admin/equipos/(components)/create-team';
import { ROUTES } from '@/shared/constants/routes';

const { mockSearchParams } = vi.hoisted(() => ({
  mockSearchParams: { current: new URLSearchParams() },
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams.current,
}));

const renderComponent = () => {
  render(
    <TooltipProvider>
      <CreateTeam />
    </TooltipProvider>,
  );

  const user = userEvent.setup();
  const link = screen.getByRole('link');

  return { user, link };
};

describe('Test on <CreateTeam /> component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.current = new URLSearchParams();
  });

  test('Should render the link with the create route', () => {
    const { link } = renderComponent();

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', ROUTES.ADMIN_TEAM_CREATE);
  });

  test('Should keep the tournament and category params in the link', () => {
    mockSearchParams.current = new URLSearchParams(
      'tournament=torneo-verano&category=varonil',
    );
    const { link } = renderComponent();

    expect(link).toHaveAttribute(
      'href',
      ROUTES.ADMIN_TEAM_CREATE +
      '?tournament=torneo-verano' +
      '&category=varonil',
    );
  });

  test('Should show the tooltip', async () => {
    const { user, link } = renderComponent();

    await user.hover(link);

    expect(screen.getByRole('tooltip')).toHaveTextContent(/crear/i);
  });
});
