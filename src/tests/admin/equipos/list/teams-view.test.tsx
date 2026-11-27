import { use, act } from 'react';
import { render, screen } from '@testing-library/react';
import { TeamsView } from '@/app/admin/equipos/(components)/teams-view';
import { fetchAdminTournamentAction } from '@/shared/actions/fetch-admin-tournament.action';
import { fetchAdminCategoryAction } from '@/shared/actions/fetch-admin-category.action';
import { ROUTES } from '@/shared/constants/routes';

const { mockRedirect, shouldSuspend } = vi.hoisted(() => ({
  mockRedirect: vi.fn(),
  shouldSuspend: { value: false },
}));

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error('NEXT_REDIRECT');
  },
}));

vi.mock('@/shared/actions/fetch-admin-tournament.action', () => ({
  fetchAdminTournamentAction: vi.fn(),
}));

vi.mock('@/shared/actions/fetch-admin-category.action', () => ({
  fetchAdminCategoryAction: vi.fn(),
}));

vi.mock('@/app/admin/equipos/(components)/teams-wrapper', () => ({
  TeamsWrapper: ({
    tournamentId,
    categoryId,
    currentPage,
    query,
  }: {
    tournamentId: string;
    categoryId: string;
    currentPage: number;
    query: string;
  }) => {
    if (shouldSuspend.value) use(new Promise(() => { }));
    return (
      <div
        data-testid="teams-wrapper"
        data-tournament-id={tournamentId}
        data-category-id={categoryId}
        data-current-page={currentPage}
        data-query={query}
      />
    );
  },
}));

vi.mock('@/app/admin/equipos/(components)/teams-table-skeleton', () => ({
  TeamsTableSkeleton: () => <div data-testid="teams-table-skeleton" />,
}));

type SearchParams = {
  query?: string;
  page?: string;
  tournament?: string;
  category?: string;
};

const tournamentId = '660e8400-e29b-41d4-a716-446655440002';
const categoryId = '770e8400-e29b-41d4-a716-446655440003';

describe('Tests on <TeamsView />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    shouldSuspend.value = false;
    vi.mocked(fetchAdminTournamentAction).mockResolvedValue({
      ok: true,
      message: 'Torneo obtenido correctamente',
      tournament: { id: tournamentId },
    } as never);
    vi.mocked(fetchAdminCategoryAction).mockResolvedValue({
      ok: true,
      message: 'Categoría obtenida correctamente',
      category: { id: categoryId },
    } as never);
  });

  test('Should render null when the tournament is missing', async () => {
    const component = await TeamsView({
      searchParamsPromise: Promise.resolve<SearchParams>({
        category: 'varonil',
      }),
    });

    expect(component).toBeNull();
  });

  test('Should render null when the category is missing', async () => {
    const component = await TeamsView({
      searchParamsPromise: Promise.resolve<SearchParams>({
        tournament: 'torneo-a',
      }),
    });

    expect(component).toBeNull();
  });

  test('Should use "none" as tournamentId when the tournament is "none"', async () => {
    const component = await TeamsView({
      searchParamsPromise: Promise.resolve<SearchParams>({
        tournament: 'none',
        category: 'varonil',
      }),
    });
    render(component);

    const wrapper = screen.getByTestId('teams-wrapper');

    expect(fetchAdminTournamentAction).not.toHaveBeenCalled();
    expect(wrapper).toHaveAttribute('data-tournament-id', 'none');
    expect(wrapper).toHaveAttribute('data-category-id', categoryId);
  });

  test('Should resolve the tournament and category ids and render the wrapper', async () => {
    const component = await TeamsView({
      searchParamsPromise: Promise.resolve<SearchParams>({
        tournament: 'torneo-jovenes-promesas',
        category: 'varonil',
        query: 'atlas-colomos',
        page: '2',
      }),
    });
    render(component);

    const wrapper = screen.getByTestId('teams-wrapper');

    expect(fetchAdminTournamentAction).toHaveBeenCalledWith('torneo-jovenes-promesas');
    expect(fetchAdminCategoryAction).toHaveBeenCalledWith('varonil');
    expect(wrapper).toHaveAttribute('data-tournament-id', tournamentId);
    expect(wrapper).toHaveAttribute('data-category-id', categoryId);
    expect(wrapper).toHaveAttribute('data-current-page', '2');
    expect(wrapper).toHaveAttribute('data-query', 'atlas-colomos');
  });

  test('Should redirect when the tournament fetch fails', async () => {
    vi.mocked(fetchAdminTournamentAction).mockResolvedValue({
      ok: false,
      message: 'Torneo no encontrado',
      tournament: null,
    } as never);

    await expect(
      TeamsView({
        searchParamsPromise: Promise.resolve<SearchParams>({
          tournament: 'torneo-a',
          category: 'varonil',
        }),
      }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      `${ROUTES.ADMIN_TEAMS}?error=${encodeURIComponent('Torneo no encontrado')}`,
    );
  });

  test('Should redirect when the category fetch fails', async () => {
    vi.mocked(fetchAdminCategoryAction).mockResolvedValue({
      ok: false,
      message: 'Categoría no encontrada',
      category: null,
    } as never);

    await expect(
      TeamsView({
        searchParamsPromise: Promise.resolve<SearchParams>({
          tournament: 'torneo-a',
          category: 'varonil',
        }),
      }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      `${ROUTES.ADMIN_TEAMS}?error=${encodeURIComponent('Categoría no encontrada')}`,
    );
  });

  test('Should render the skeleton while the wrapper is suspended', async () => {
    shouldSuspend.value = true;

    await act(async () => {
      const component = await TeamsView({
        searchParamsPromise: Promise.resolve<SearchParams>({
          tournament: 'torneo-a',
          category: 'varonil',
        }),
      });
      render(component);
    });

    expect(screen.getByTestId('teams-table-skeleton')).toBeInTheDocument();
  });
});
