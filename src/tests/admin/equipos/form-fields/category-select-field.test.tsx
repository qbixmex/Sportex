import { render, screen } from '@testing-library/react';
import { CategorySelectField } from '@/app/admin/equipos/(components)/form-fields/category-select-field';
import { fetchCategoriesAction } from '@/app/admin/equipos/(actions)';
import { ROUTES } from '@/shared/constants/routes';

const mockRedirect = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error('NEXT_REDIRECT');
  },
}));

vi.mock('@/app/admin/equipos/(actions)', () => ({
  fetchCategoriesAction: vi.fn(),
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/category-select-field/categories-form-select', () => ({
  CategoriesFormSelect: ({ categories }: { categories: unknown[] }) => (
    <div data-testid="categories-form-select">{categories.length}</div>
  ),
}));

const categories = [
  {
    id: '770e8400-e29b-41d4-a716-446655440003',
    name: 'Varonil',
    permalink: 'varonil',
  },
];

describe('Test on <CategorySelectField />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Should render <CategoriesFormSelect /> with the categories', async () => {
    vi.mocked(fetchCategoriesAction).mockResolvedValue({
      ok: true,
      message: 'Categorías obtenidas correctamente',
      categories,
    });

    const ServerComponent = await CategorySelectField({});
    render(ServerComponent);

    expect(screen.getByTestId('categories-form-select')).toHaveTextContent(
      String(categories.length),
    );
  });

  test('Should render the select when there are no categories', async () => {
    vi.mocked(fetchCategoriesAction).mockResolvedValue({
      ok: true,
      message: 'Categorías obtenidas correctamente',
      categories: [],
    });

    const ServerComponent = await CategorySelectField({});
    render(ServerComponent);

    expect(screen.getByTestId('categories-form-select')).toHaveTextContent('0');
  });

  test('Should redirect when the fetch fails', async () => {
    vi.mocked(fetchCategoriesAction).mockResolvedValue({
      ok: false,
      message: 'Error al obtener las categorías',
      categories: [],
    });

    await expect(CategorySelectField({})).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      `${ROUTES.ADMIN_PLAYOFFS}?error=${encodeURIComponent(
        'Error al obtener las categorías',
      )}`,
    );
  });
});
