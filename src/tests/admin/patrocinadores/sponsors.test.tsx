import { render, screen } from '@testing-library/react';
import { CustomSponsorsView } from '@/app/admin/patrocinadores/(components)/sponsors-view';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('page=1'),
  usePathname: () => '/admin',
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

vi.mock('@/shared/components/search', () => ({
  Search: () => null,
}));

vi.mock('@/app/admin/patrocinadores/(components)/create-sponsor', () => ({
  CreateSponsor: () => null,
}));

vi.mock('@/app/admin/patrocinadores/sponsors-table', () => ({
  SponsorsTable: () => null,
}));

describe('Test on <SponsorsPage /> component', () => {
  test('Should render correctly', async () => {
    const ServerComponent = await CustomSponsorsView({
      searchParams: Promise.resolve({
        query: undefined,
        page: undefined,
        error: undefined,
      }),
    });
    render(ServerComponent);

    expect(screen.getByText(/patrocinadores/i)).toBeInTheDocument();
  });
});
