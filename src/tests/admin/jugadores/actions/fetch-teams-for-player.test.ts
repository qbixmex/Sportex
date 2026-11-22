const { mockFindMany } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
}));

vi.mock('next/cache');

vi.mock('@/lib/prisma', () => ({
  default: {
    team: {
      findMany: mockFindMany,
    },
  },
}));

import { fetchTeamsForPlayer } from '@/app/admin/jugadores/(actions)/fetchTeamsForPlayer';

const tournamentPermalink = 'tournament-test';
const categoryPermalink = 'category-test';

describe('Tests on fetch teams for player server action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mockFindMany.mockResolvedValue([
      { id: 'd3ec5a37-1308-45a1-a09c-dcb8ee056f66', name: 'Eagles' },
      { id: 'b3638954-28d7-43ec-8858-4b82199f5f03', name: 'Sharks' },
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should return error when tournament permalink is empty', async () => {
    const response = await fetchTeamsForPlayer({
      tournamentPermalink: '',
      categoryPermalink,
    });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/obligatorios/i);
    expect(response.teams).toEqual([]);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  test('Should return error when category permalink is empty', async () => {
    const response = await fetchTeamsForPlayer({
      tournamentPermalink,
      categoryPermalink: '',
    });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/obligatorios/i);
    expect(response.teams).toEqual([]);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  test('Should return teams successfully filtered by tournament and category', async () => {
    const response = await fetchTeamsForPlayer({
      tournamentPermalink,
      categoryPermalink,
    });

    expect(response.ok).toBe(true);
    expect(response.teams).toEqual([
      { id: 'd3ec5a37-1308-45a1-a09c-dcb8ee056f66', name: 'Eagles' },
      { id: 'b3638954-28d7-43ec-8858-4b82199f5f03', name: 'Sharks' },
    ]);
    expect(mockFindMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      where: {
        category: { permalink: categoryPermalink },
        tournament: { permalink: tournamentPermalink },
      },
      select: { id: true, name: true },
    });
  });

  test('Should filter teams without tournament when permalink is "none"', async () => {
    await fetchTeamsForPlayer({
      tournamentPermalink: 'none',
      categoryPermalink,
    });

    expect(mockFindMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      where: {
        category: { permalink: categoryPermalink },
        tournamentId: null,
      },
      select: { id: true, name: true },
    });
  });

  test('Should return an empty list when there are no matching teams', async () => {
    mockFindMany.mockResolvedValue([]);

    const response = await fetchTeamsForPlayer({
      tournamentPermalink,
      categoryPermalink,
    });

    expect(response.ok).toBe(true);
    expect(response.teams).toEqual([]);
  });

  test('Should return error when findMany throws an Error', async () => {
    mockFindMany.mockRejectedValue(new Error('Database error'));

    const response = await fetchTeamsForPlayer({
      tournamentPermalink,
      categoryPermalink,
    });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/database error/i);
    expect(response.teams).toEqual([]);
  });

  test('Should return error on unknown error', async () => {
    mockFindMany.mockRejectedValue('Some non-error object');

    const response = await fetchTeamsForPlayer({
      tournamentPermalink,
      categoryPermalink,
    });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/error inesperado/i);
    expect(response.teams).toEqual([]);
  });
});
