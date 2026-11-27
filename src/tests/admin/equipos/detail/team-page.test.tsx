import { use, act } from 'react';
import { render, screen } from '@testing-library/react';
import TeamPage from '@/app/admin/equipos/[id]/page';

const { shouldSuspend } = vi.hoisted(() => ({
  shouldSuspend: { value: false },
}));

vi.mock('@/app/admin/equipos/(components)/team-view-skeleton', () => ({
  TeamViewSkeleton: () => <div data-testid="team-view-skeleton" />,
}));

vi.mock('@/app/admin/equipos/[id]/team-view', () => ({
  TeamPageView: () => {
    if (shouldSuspend.value) use(new Promise(() => { }));
    return <div data-testid="team-page-view" />;
  },
}));

describe('Test on <TeamPage />', () => {
  const params = Promise.resolve({
    id: '550e8400-e29b-41d4-a716-446655440030',
  });

  beforeEach(() => {
    shouldSuspend.value = false;
  });

  test('Should render <TeamPageView />', () => {
    render(<TeamPage params={params} />);

    expect(screen.getByTestId('team-page-view')).toBeInTheDocument();
  });

  test('Should render the skeleton while the view is suspended', async () => {
    shouldSuspend.value = true;

    await act(async () => {
      render(<TeamPage params={params} />);
    });

    expect(screen.getByTestId('team-view-skeleton')).toBeInTheDocument();
  });
});
