const { mockFindMany, mockCount } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
}));

vi.mock('next/cache');

vi.mock('@/lib/prisma', () => ({
  default: {
    team: {
      findMany: mockFindMany,
      count: mockCount,
    },
  },
}));

import { fetchAdminTeamsAction } from '@/app/admin/equipos/(actions)/fetch-admin-teams.action';

const tournamentId = '550e8400-e29b-41d4-a716-446655440000';
const categoryId = '660e8400-e29b-41d4-a716-446655440001';

describe('Tests on fetchAdminTeamsAction server action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should filter teams by tournament and category', async () => {
    const response = await fetchAdminTeamsAction(tournamentId, categoryId);

    expect(response.ok).toBe(true);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { AND: [{ tournamentId, categoryId }] },
      }),
    );
    expect(mockCount).toHaveBeenCalledWith({
      where: { AND: [{ tournamentId, categoryId }] },
    });
  });

  test('Should filter teams without tournament when tournamentId is "none"', async () => {
    const response = await fetchAdminTeamsAction('none', categoryId);

    expect(response.ok).toBe(true);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { AND: [{ tournamentId: null, categoryId }] },
      }),
    );
    expect(mockCount).toHaveBeenCalledWith({
      where: { AND: [{ tournamentId: null, categoryId }] },
    });
  });

  test('Should return error when database throws', async () => {
    mockFindMany.mockRejectedValue(new Error('DB connection failed'));

    const response = await fetchAdminTeamsAction(tournamentId, categoryId);

    expect(response.ok).toBe(false);
    expect(response.message).toBe('DB connection failed');
    expect(response.teams).toEqual([]);
    expect(response.pagination).toEqual({ currentPage: 0, totalPages: 0 });
  });

  test('Should add a case-insensitive name search when searchTerm is provided', async () => {
    await fetchAdminTeamsAction(tournamentId, categoryId, {
      searchTerm: 'agu',
    });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [{ tournamentId, categoryId }],
          OR: [{ name: { contains: 'agu', mode: 'insensitive' } }],
        },
      }),
    );
    expect(mockCount).toHaveBeenCalledWith({
      where: {
        AND: [{ tournamentId, categoryId }],
        OR: [{ name: { contains: 'agu', mode: 'insensitive' } }],
      },
    });
  });

  test('Should apply the pagination options', async () => {
    await fetchAdminTeamsAction(tournamentId, categoryId, {
      page: 3,
      take: 10,
    });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, skip: 20 }),
    );
  });

  test('Should fall back to the default pagination values when they are invalid', async () => {
    await fetchAdminTeamsAction(tournamentId, categoryId, {
      page: NaN,
      take: NaN,
    });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 12, skip: 0 }),
    );
  });

  test('Should map the players count', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'American School',
        permalink: 'american-school',
        imageUrl: null,
        format: '11',
        gender: 'male',
        active: true,
        coach: null,
        _count: { players: 5 },
      },
    ]);

    const response = await fetchAdminTeamsAction(tournamentId, categoryId);

    expect(response.ok).toBe(true);
    expect(response.teams[0].playersCount).toBe(5);
  });

  test('Should compute the total pages', async () => {
    mockCount.mockResolvedValue(25);

    const response = await fetchAdminTeamsAction(tournamentId, categoryId, {
      page: 1,
      take: 12,
    });

    expect(response.pagination).toEqual({ currentPage: 1, totalPages: 3 });
  });

  test('Should return an unexpected error for non-Error failures', async () => {
    mockFindMany.mockRejectedValue('Unexpected failure');

    const response = await fetchAdminTeamsAction(tournamentId, categoryId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/error inesperado/i);
    expect(response.teams).toEqual([]);
  });
});
