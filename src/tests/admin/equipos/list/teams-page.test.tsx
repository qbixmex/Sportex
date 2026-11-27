import { use, act } from 'react';
import { render, screen } from '@testing-library/react';
import TeamsPage from '@/app/admin/equipos/page';

const { shouldSuspend } = vi.hoisted(() => ({
  shouldSuspend: { value: false },
}));

vi.mock('@/shared/components/search', () => ({
  Search: () => <div data-testid="search-component" />,
}));

vi.mock('@/app/admin/equipos/(components)/clear-filters', () => ({
  ClearFilters: () => <div data-testid="clear-filters" />,
}));

vi.mock('@/app/admin/equipos/(components)/create-team', () => ({
  CreateTeam: () => <div data-testid="create-team" />,
}));

vi.mock('@/app/admin/equipos/(components)/TournamentsSelectorSkeleton', () => ({
  TournamentsSelectorSkeleton: () => (
    <div data-testid="tournaments-selector-skeleton" />
  ),
}));

vi.mock('@/shared/components/errorHandler', () => ({
  ErrorHandler: () => null,
}));

vi.mock('@/app/admin/equipos/(components)/teams-view', () => ({
  TeamsView: () => <div data-testid="teams-view" />,
}));

vi.mock('@/shared/components/search-params-selectors', () => ({
  SearchParamsSelectors: () => {
    if (shouldSuspend.value) use(new Promise(() => { }));
    return <div data-testid="search-params-selectors" />;
  },
}));

type SearchParams = {
  query?: string;
  page?: string;
  tournament?: string;
  category?: string;
};

describe('Tests on teams page', () => {
  beforeEach(() => {
    shouldSuspend.value = false;
  });

  test('Should render the heading', () => {
    render(
      <TeamsPage
        searchParams={Promise.resolve<SearchParams>({})}
      />,
    );

    const pageTitle = screen.queryByText(/^equipos$/i);

    expect(pageTitle).toBeInTheDocument();
  });

  test('Should render <Search />, <ClearFilters /> and <CreateTeam />', () => {
    render(
      <TeamsPage
        searchParams={Promise.resolve<SearchParams>({})}
      />,
    );

    expect(screen.getByTestId('search-component')).toBeInTheDocument();
    expect(screen.getByTestId('clear-filters')).toBeInTheDocument();
    expect(screen.getByTestId('create-team')).toBeInTheDocument();
  });

  test('Should render <SearchParamsSelectors /> and <TeamsView />', () => {
    render(
      <TeamsPage
        searchParams={Promise.resolve<SearchParams>({})}
      />,
    );

    expect(screen.queryByTestId('search-params-selectors')).toBeInTheDocument();
    expect(screen.queryByTestId('teams-view')).toBeInTheDocument();
  });

  test('Should render the skeleton while the selectors are suspended', async () => {
    shouldSuspend.value = true;

    await act(async () => {
      render(
        <TeamsPage
          searchParams={Promise.resolve<SearchParams>({})}
        />,
      );
    });

    expect(
      screen.getByTestId('tournaments-selector-skeleton'),
    ).toBeInTheDocument();
  });
});
