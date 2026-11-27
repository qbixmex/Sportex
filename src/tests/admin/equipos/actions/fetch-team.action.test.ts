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

import { fetchTeamAction } from '@/app/admin/equipos/(actions)/fetchTeamAction';

const teamId = '550e8400-e29b-41d4-a716-446655440030';

const field = {
  id: 'aa0e8400-e29b-41d4-a716-446655440035',
  name: 'Cancha 1',
  map: null,
  address: 'Calle Falsa 123',
  city: 'Guadalajara',
  state: 'Jalisco',
  country: 'México',
};

const teamFromDatabase = {
  id: teamId,
  name: 'Águilas',
  permalink: 'aguilas',
  imageUrl: null,
  imagePublicID: null,
  format: '11',
  gender: 'male',
  country: 'México',
  city: 'Guadalajara',
  state: 'Jalisco',
  emails: ['aguilas@example.com'],
  address: 'Calle Falsa 123',
  active: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-15'),
  tournament: {
    id: '660e8400-e29b-41d4-a716-446655440031',
    name: 'Torneo A',
    permalink: 'torneo-a',
  },
  category: {
    id: '770e8400-e29b-41d4-a716-446655440032',
    name: 'Sub-20',
    permalink: 'sub-20',
  },
  coach: {
    id: '880e8400-e29b-41d4-a716-446655440033',
    name: 'Carlos Pérez',
  },
  players: [
    {
      id: '990e8400-e29b-41d4-a716-446655440034',
      name: 'Juan López',
    },
  ],
  fields: [{ field }],
};

describe('Tests on fetchTeamAction server action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should return the team with its fields mapped', async () => {
    mockFindFirst.mockResolvedValue(teamFromDatabase);

    const response = await fetchTeamAction(teamId);

    expect(response.ok).toBe(true);
    expect(response.message).toMatch(/correctamente/i);
    expect(response.team).toEqual({
      ...teamFromDatabase,
      fields: [field],
    });
    expect(mockFindFirst).toHaveBeenCalledOnce();
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: teamId } }),
    );
  });

  test('Should return an error when the team is not found', async () => {
    mockFindFirst.mockResolvedValue(null);

    const response = await fetchTeamAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toContain(teamId);
    expect(response.team).toBeNull();
  });

  test('Should return an error when the database fails', async () => {
    mockFindFirst.mockRejectedValue(new Error('DB connection failed'));

    const response = await fetchTeamAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/no se pudo obtener el equipo/i);
    expect(response.team).toBeNull();
  });

  test('Should return an unexpected error for non-Error failures', async () => {
    mockFindFirst.mockRejectedValue('Something unexpected');

    const response = await fetchTeamAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/error inesperado/i);
    expect(response.team).toBeNull();
  });
});
