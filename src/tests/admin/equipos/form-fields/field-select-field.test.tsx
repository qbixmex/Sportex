import { render, screen } from '@testing-library/react';
import { FieldSelectField } from '@/app/admin/equipos/(components)/form-fields/field-select-field';
import { fetchFieldsForTeam } from '@/app/admin/equipos/(actions)/fetchFieldsForTeam';
import { ROUTES } from '@/shared/constants/routes';

const mockRedirect = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error('NEXT_REDIRECT');
  },
}));

vi.mock('@/app/admin/equipos/(actions)/fetchFieldsForTeam', () => ({
  fetchFieldsForTeam: vi.fn(),
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/field-select-field/fields-form-select', () => ({
  FieldsFormSelect: ({ fields }: { fields: unknown[] }) => (
    <div data-testid="fields-form-select">{fields.length}</div>
  ),
}));

const fields = [
  { id: 'aa0e8400-e29b-41d4-a716-446655440035', name: 'Cancha 1' },
];

describe('Test on <FieldSelectField />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Should render <FieldsFormSelect /> with the fields', async () => {
    vi.mocked(fetchFieldsForTeam).mockResolvedValue({
      ok: true,
      message: 'Canchas obtenidas correctamente',
      fields,
    });

    const ServerComponent = await FieldSelectField({});
    render(ServerComponent);

    expect(screen.getByTestId('fields-form-select')).toHaveTextContent(
      String(fields.length),
    );
  });

  test('Should redirect when the fetch fails', async () => {
    vi.mocked(fetchFieldsForTeam).mockResolvedValue({
      ok: false,
      message: 'Error al obtener las canchas',
      fields: [],
    });

    await expect(FieldSelectField({})).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      `${ROUTES.ADMIN_TEAMS}?error=${encodeURIComponent(
        'Error al obtener las canchas',
      )}`,
    );
  });
});
