import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ClearFilters } from '@/app/admin/equipos/(components)/clear-filters';

const { mockReplace, mockRefresh, mockSearchParams } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockRefresh: vi.fn(),
  mockSearchParams: { current: new URLSearchParams() },
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams.current,
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
  usePathname: () => '/admin/equipos',
}));

const renderComponent = () => {
  render(
    <TooltipProvider>
      <ClearFilters />
    </TooltipProvider>,
  );

  const user = userEvent.setup();
  const button = screen.getByRole('button');

  return { user, button };
};

describe('Test on <ClearFilters /> component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.current = new URLSearchParams();
  });

  test('Should render the button and the tooltip', async () => {
    const { user, button } = renderComponent();

    expect(button).toBeInTheDocument();

    await user.hover(button);

    expect(screen.getByRole('tooltip')).toHaveTextContent(/borrar filtros/i);
  });

  test('Should keep the tournament parameter when clearing filters', async () => {
    mockSearchParams.current = new URLSearchParams('torneo=torneo-a');
    const { user, button } = renderComponent();

    await user.click(button);

    expect(mockReplace).toHaveBeenCalledWith('/admin/equipos?torneo=torneo-a');
    expect(mockRefresh).toHaveBeenCalled();
  });

  test('Should clear all filters when there is no tournament parameter', async () => {
    const { user, button } = renderComponent();

    await user.click(button);

    expect(mockReplace).toHaveBeenCalledWith('/admin/equipos?');
    expect(mockRefresh).toHaveBeenCalled();
  });
});
