import ResultsPage from '@/app/(public)/resultados/[id]/page';
import { render, screen } from '@testing-library/react';

const mockedMatchContent = vi.hoisted(() => vi.fn());

vi.mock('@/app/(public)/resultados/(components)/match-content', () => ({
  MatchContent: (props: unknown) => {
    mockedMatchContent(props);
    return <div data-testid="match-content" />;
  },
}));

const MATCH_ID = '2c1b9b1e-6f2d-4e5a-9c3b-1a7d8e4f6c01';

describe('Tests on <ResultsPage />', () => {
  beforeEach(() => {
    mockedMatchContent.mockClear();
  });

  test('Should render the page heading', () => {
    render(
      <ResultsPage params={Promise.resolve({ id: MATCH_ID, slug: 'slug' })} />,
    );

    const heading = screen.getByRole('heading', {
      level: 1,
      name: /información del encuentro/i,
    });

    expect(heading).toBeInTheDocument();
  });

  test('Should render the page region with an accessible label', () => {
    render(
      <ResultsPage params={Promise.resolve({ id: MATCH_ID, slug: 'slug' })} />,
    );

    expect(
      screen.getByLabelText(/información del encuentro/i),
    ).toBeInTheDocument();
  });

  test('Should render <MatchContent /> component', () => {
    render(
      <ResultsPage params={Promise.resolve({ id: MATCH_ID, slug: 'slug' })} />,
    );

    expect(screen.getByTestId('match-content')).toBeInTheDocument();
  });

  test('Should pass params to <MatchContent /> component', async () => {
    const params = Promise.resolve({ id: MATCH_ID, slug: 'slug' });

    render(<ResultsPage params={params} />);

    expect(mockedMatchContent).toHaveBeenCalledTimes(1);

    const contentProps = mockedMatchContent.mock.calls[0][0] as {
      params: Promise<{ id: string; slug: string }>;
    };

    await expect(contentProps.params).resolves.toEqual({
      id: MATCH_ID,
      slug: 'slug',
    });
  });
});
