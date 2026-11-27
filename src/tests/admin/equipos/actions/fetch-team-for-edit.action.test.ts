const { mockFindFirst } = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
}));

vi.mock('next/cache');

vi.mock('@/lib/prisma', () => ({
  default: {
    team: {
      findFirst: mockFindFirst,
    },
  },
}));

import { fetchTeamForEditAction } from '@/app/admin/equipos/(actions)/fetch-team-for-edit.action';

const teamId = '550e8400-e29b-41d4-a716-446655440001';
const fieldId = '880e8400-e29b-41d4-a716-446655440004';

const teamFromDatabase = {
  id: teamId,
  name: 'Águilas',
  permalink: 'aguilas',
  format: '11',
  gender: 'male',
  country: 'México',
  state: 'Jalisco',
  city: 'Guadalajara',
  coachId: 'b7e2ca32-af95-4750-bf63-6a338b236097',
  emails: ['aguilas@example.com'],
  address: 'Calle Falsa 123, Colonia Centro',
  active: true,
  tournament: {
    id: '660e8400-e29b-41d4-a716-446655440002',
    permalink: 'torneo-a',
  },
  category: {
    id: '770e8400-e29b-41d4-a716-446655440003',
    permalink: 'varonil',
  },
  fields: [{ fieldId }],
};

describe('Tests on fetchTeamForEditAction server action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should return the team with its field ids', async () => {
    mockFindFirst.mockResolvedValue(teamFromDatabase);

    const response = await fetchTeamForEditAction({ teamId });

    expect(response.ok).toBe(true);
    expect(response.message).toMatch(/correctamente/i);
    expect(response.team).toEqual({
      ...teamFromDatabase,
      fieldsIds: [fieldId],
    });
    expect(mockFindFirst).toHaveBeenCalledOnce();
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: teamId } }),
    );
  });

  test('Should return an error when the team is not found', async () => {
    mockFindFirst.mockResolvedValue(null);

    const response = await fetchTeamForEditAction({ teamId });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/no existe/i);
    expect(response.team).toBeNull();
  });

  test('Should return an error when the database fails', async () => {
    mockFindFirst.mockRejectedValue(new Error('DB connection failed'));

    const response = await fetchTeamForEditAction({ teamId });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/no se pudo obtener el equipo/i);
    expect(response.team).toBeNull();
  });

  test('Should return an unexpected error for non-Error failures', async () => {
    mockFindFirst.mockRejectedValue('Something unexpected');

    const response = await fetchTeamForEditAction({ teamId });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/error inesperado/i);
    expect(response.team).toBeNull();
  });
});
