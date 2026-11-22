import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TournamentsSelector } from '@/shared/components/tournaments-selector';

const { mockPush, mockReplace, mockUseSearchParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  mockUseSearchParams: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: mockUseSearchParams,
  usePathname: () => '/admin/equipos',
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

const tournaments = [
  { id: '1', name: 'Torneo A', permalink: 'torneo-a' },
  { id: '2', name: 'Torneo B', permalink: 'torneo-b' },
];

describe('Tests on <TournamentsSelector />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  test('Should not show "Sin torneo" when includeNoTournament is false', async () => {
    const user = userEvent.setup();
    render(<TournamentsSelector tournaments={tournaments} />);

    await user.click(screen.getByRole('combobox'));

    expect(screen.queryByText('Sin torneo')).not.toBeInTheDocument();
    expect(screen.getByText('Torneo A')).toBeInTheDocument();
  });

  test('Should show "Sin torneo" when includeNoTournament is true', async () => {
    const user = userEvent.setup();
    render(
      <TournamentsSelector tournaments={tournaments} includeNoTournament />,
    );

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByText('Sin torneo')).toBeInTheDocument();
  });

  test('Should select "Sin torneo" and push tournament=none', async () => {
    const user = userEvent.setup();
    render(
      <TournamentsSelector tournaments={tournaments} includeNoTournament />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Sin torneo'));

    expect(mockPush).toHaveBeenCalledWith('/admin/equipos?tournament=none');
  });

  test('Should remove the page param when a tournament is selected', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('page=2'));

    const user = userEvent.setup();
    render(<TournamentsSelector tournaments={tournaments} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Torneo B'));

    expect(mockPush).toHaveBeenCalledWith('/admin/equipos?tournament=torneo-b');
  });

  test('Should keep the other filters and remove the page param when a tournament is selected', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('page=2&query=river'));

    const user = userEvent.setup();
    render(<TournamentsSelector tournaments={tournaments} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Torneo A'));

    expect(mockPush).toHaveBeenCalledWith('/admin/equipos?query=river&tournament=torneo-a');
  });
});
