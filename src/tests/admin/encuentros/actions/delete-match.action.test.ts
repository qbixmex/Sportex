const {
  MockPrismaClientKnownRequestError,
  mockFindFirst,
  mockStandingsFindMany,
  mockTransaction,
  mockTx,
  mockGetSession,
} = vi.hoisted(() => {
  class MockPrismaClientKnownRequestError extends Error {
    code: string;
    meta?: Record<string, unknown>;
    constructor(
      message: string,
      options: { code: string; meta?: Record<string, unknown> },
    ) {
      super(message);
      this.name = 'PrismaClientKnownRequestError';
      this.code = options.code;
      this.meta = options.meta;
    }
  }

  const mockTx = {
    match: { delete: vi.fn() },
    standings: { update: vi.fn() },
  };

  return {
    MockPrismaClientKnownRequestError,
    mockFindFirst: vi.fn(),
    mockStandingsFindMany: vi.fn(),
    mockTransaction: vi.fn(),
    mockTx,
    mockGetSession: vi.fn(),
  };
});

vi.mock('next/cache');

vi.mock('@/lib/get-session', () => ({
  getSession: mockGetSession,
  requireAdmin: async () => {
    const session = await mockGetSession();

    if (!session?.user) {
      return {
        ok: false,
        message: 'Debes estar autentificado para realizar esta acción',
      };
    }

    if (!session.user.roles?.includes('admin')) {
      return {
        ok: false,
        message: 'No tienes permisos administrativos para realizar esta acción',
      };
    }

    return { ok: true, session };
  },
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    $transaction: mockTransaction,
    match: {
      findFirst: mockFindFirst,
    },
    standings: {
      findMany: mockStandingsFindMany,
    },
  },
}));

vi.mock('@/generated/prisma/client', () => ({
  Prisma: {
    PrismaClientKnownRequestError: MockPrismaClientKnownRequestError,
  },
}));

import { deleteMatchAction } from '@/app/admin/encuentros/(actions)/delete-match.action';
import { MATCH_MODE, MATCH_STATUS, SHOOTOUT_STATUS } from '@/shared/enums';

const matchId = '0251b9bf-55e5-48fb-ae2c-6fcdad308d13';
const localId = '3f24c2e0-7fd2-46e4-94ba-4dd0b557e675';
const visitorId = '99182b8e-143a-479b-8496-24f283e847ae';
const tournamentId = 'f641c5b8-0bcb-4b2c-ab90-27210ba17dac';
const categoryId = '1ff58d74-2761-42f2-8250-2e009937921f';

const baseMatch = {
  id: matchId,
  status: MATCH_STATUS.SCHEDULED,
  mode: MATCH_MODE.LEAGUE,
  localId,
  visitorId,
  localScore: 0,
  visitorScore: 0,
  tournamentId,
  categoryId,
  penaltyShootout: null,
};

const localStanding = {
  id: 'standings-local',
  teamId: localId,
  additionalPoints: 0,
  totalPoints: 0,
};

const visitorStanding = {
  id: 'standings-visitor',
  teamId: visitorId,
  additionalPoints: 0,
  totalPoints: 0,
};

describe('Tests on deleteMatchAction server action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => { });
    mockGetSession.mockResolvedValue({
      user: { id: 'b7e2ca32-af95-4750-bf63-6a338b236097', roles: ['admin'] },
    });
    mockFindFirst.mockResolvedValue(baseMatch);
    mockStandingsFindMany.mockResolvedValue([localStanding, visitorStanding]);
    mockTransaction.mockImplementation((cb: (tx: typeof mockTx) => unknown) => cb(mockTx));
    mockTx.match.delete.mockResolvedValue({ id: matchId });
    mockTx.standings.update.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should return error when user is not authenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await deleteMatchAction(matchId);

    expect(response.ok).toBe(false);
    expect(response.message).toBe('Debes estar autentificado para realizar esta acción');
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return error when user does not have admin role', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'c45414c0-044b-4319-acbb-45584a0839fa', roles: ['user'] },
    });

    const response = await deleteMatchAction(matchId);

    expect(response.ok).toBe(false);
    expect(response.message).toBe('No tienes permisos administrativos para realizar esta acción');
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return error when the match does not exist', async () => {
    mockFindFirst.mockResolvedValue(null);

    const response = await deleteMatchAction(matchId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/no se puede eliminar/i);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should delete a scheduled match without touching the standings', async () => {
    const response = await deleteMatchAction(matchId);

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: matchId } }),
    );
    expect(mockStandingsFindMany).not.toHaveBeenCalled();
    expect(mockTx.standings.update).not.toHaveBeenCalled();
    expect(mockTx.match.delete).toHaveBeenCalledWith({ where: { id: matchId } });
    expect(response.ok).toBe(true);
    expect(response.message).toMatch(/eliminado correctamente/i);
  });

  test('Should delete a completed friendly match without touching the standings', async () => {
    mockFindFirst.mockResolvedValue({
      ...baseMatch,
      status: MATCH_STATUS.COMPLETED,
      mode: MATCH_MODE.FRIENDLY,
      localScore: 2,
      visitorScore: 1,
    });

    const response = await deleteMatchAction(matchId);

    expect(mockStandingsFindMany).not.toHaveBeenCalled();
    expect(mockTx.standings.update).not.toHaveBeenCalled();
    expect(mockTx.match.delete).toHaveBeenCalledWith({ where: { id: matchId } });
    expect(response.ok).toBe(true);
  });

  test('Should revert the points when the local team won', async () => {
    mockFindFirst.mockResolvedValue({
      ...baseMatch,
      status: MATCH_STATUS.COMPLETED,
      localScore: 2,
      visitorScore: 1,
    });

    const response = await deleteMatchAction(matchId);

    expect(mockTx.standings.update).toHaveBeenCalledWith({
      where: { id: localStanding.id },
      data: {
        matchesPlayed: { decrement: 1 },
        wins: { decrement: 1 },
        draws: { decrement: 0 },
        losses: { decrement: 0 },
        goalsFor: { decrement: 2 },
        goalsAgainst: { decrement: 1 },
        goalsDifference: { decrement: 1 },
        points: { decrement: 3 },
        totalPoints: { decrement: 3 },
      },
    });

    expect(mockTx.standings.update).toHaveBeenCalledWith({
      where: { id: visitorStanding.id },
      data: {
        matchesPlayed: { decrement: 1 },
        wins: { decrement: 0 },
        draws: { decrement: 0 },
        losses: { decrement: 1 },
        goalsFor: { decrement: 1 },
        goalsAgainst: { decrement: 2 },
        goalsDifference: { decrement: -1 },
        points: { decrement: 0 },
        totalPoints: { decrement: 0 },
      },
    });

    expect(mockTx.match.delete).toHaveBeenCalledWith({ where: { id: matchId } });
    expect(response.ok).toBe(true);
  });

  test('Should revert the points when the visitor team won', async () => {
    mockFindFirst.mockResolvedValue({
      ...baseMatch,
      status: MATCH_STATUS.COMPLETED,
      localScore: 0,
      visitorScore: 3,
    });

    const response = await deleteMatchAction(matchId);

    expect(mockTx.standings.update).toHaveBeenCalledWith({
      where: { id: localStanding.id },
      data: expect.objectContaining({
        wins: { decrement: 0 },
        losses: { decrement: 1 },
        goalsFor: { decrement: 0 },
        goalsAgainst: { decrement: 3 },
        goalsDifference: { decrement: -3 },
        points: { decrement: 0 },
        totalPoints: { decrement: 0 },
      }),
    });

    expect(mockTx.standings.update).toHaveBeenCalledWith({
      where: { id: visitorStanding.id },
      data: expect.objectContaining({
        wins: { decrement: 1 },
        losses: { decrement: 0 },
        points: { decrement: 3 },
        totalPoints: { decrement: 3 },
      }),
    });

    expect(response.ok).toBe(true);
  });

  test('Should revert one point per team on a draw', async () => {
    mockFindFirst.mockResolvedValue({
      ...baseMatch,
      status: MATCH_STATUS.COMPLETED,
      localScore: 1,
      visitorScore: 1,
    });

    await deleteMatchAction(matchId);

    expect(mockTx.standings.update).toHaveBeenCalledWith({
      where: { id: localStanding.id },
      data: expect.objectContaining({
        draws: { decrement: 1 },
        points: { decrement: 1 },
        totalPoints: { decrement: 1 },
      }),
    });

    expect(mockTx.standings.update).toHaveBeenCalledWith({
      where: { id: visitorStanding.id },
      data: expect.objectContaining({
        draws: { decrement: 1 },
        points: { decrement: 1 },
        totalPoints: { decrement: 1 },
      }),
    });
  });

  test('Should also revert the shootout additional point on a draw', async () => {
    mockFindFirst.mockResolvedValue({
      ...baseMatch,
      status: MATCH_STATUS.COMPLETED,
      localScore: 1,
      visitorScore: 1,
      penaltyShootout: {
        status: SHOOTOUT_STATUS.COMPLETED,
        winnerTeamId: localId,
      },
    });

    mockStandingsFindMany.mockResolvedValue([
      { ...localStanding, additionalPoints: 1, totalPoints: 2 },
      { ...visitorStanding, additionalPoints: 0, totalPoints: 1 },
    ]);

    await deleteMatchAction(matchId);

    expect(mockTx.standings.update).toHaveBeenCalledWith({
      where: { id: localStanding.id },
      data: expect.objectContaining({
        points: { decrement: 1 },
        additionalPoints: { decrement: 1 },
        totalPoints: { decrement: 2 },
      }),
    });

    expect(mockTx.standings.update).toHaveBeenCalledWith({
      where: { id: visitorStanding.id },
      data: expect.objectContaining({
        points: { decrement: 1 },
        totalPoints: { decrement: 1 },
      }),
    });
  });

  test('Should revert the shootout point on a match that is not completed', async () => {
    mockFindFirst.mockResolvedValue({
      ...baseMatch,
      status: MATCH_STATUS.SCHEDULED,
      localScore: 1,
      visitorScore: 1,
      penaltyShootout: {
        status: SHOOTOUT_STATUS.COMPLETED,
        winnerTeamId: localId,
      },
    });

    mockStandingsFindMany.mockResolvedValue([
      { ...localStanding, additionalPoints: 1, totalPoints: 1 },
      visitorStanding,
    ]);

    await deleteMatchAction(matchId);

    expect(mockTx.standings.update).toHaveBeenCalledTimes(1);
    expect(mockTx.standings.update).toHaveBeenCalledWith({
      where: { id: localStanding.id },
      data: {
        additionalPoints: { decrement: 1 },
        totalPoints: { decrement: 1 },
      },
    });
  });

  test('Should not subtract the shootout point when the standings row no longer has it', async () => {
    mockFindFirst.mockResolvedValue({
      ...baseMatch,
      status: MATCH_STATUS.COMPLETED,
      localScore: 1,
      visitorScore: 1,
      penaltyShootout: {
        status: SHOOTOUT_STATUS.COMPLETED,
        winnerTeamId: localId,
      },
    });

    mockStandingsFindMany.mockResolvedValue([
      { ...localStanding, additionalPoints: 0, totalPoints: 1 },
      { ...visitorStanding, additionalPoints: 0, totalPoints: 1 },
    ]);

    await deleteMatchAction(matchId);

    expect(mockTx.standings.update).toHaveBeenCalledWith({
      where: { id: localStanding.id },
      data: expect.objectContaining({
        points: { decrement: 1 },
        totalPoints: { decrement: 1 },
      }),
    });

    const localUpdate = mockTx.standings.update.mock.calls
      .find(([args]) => args.where.id === localStanding.id)?.[0];

    expect(localUpdate.data).not.toHaveProperty('additionalPoints');
  });

  test('Should delete the match when one of the standings rows is missing', async () => {
    mockFindFirst.mockResolvedValue({
      ...baseMatch,
      status: MATCH_STATUS.COMPLETED,
      localScore: 2,
      visitorScore: 0,
    });

    mockStandingsFindMany.mockResolvedValue([localStanding]);

    const response = await deleteMatchAction(matchId);

    expect(mockTx.standings.update).toHaveBeenCalledTimes(1);
    expect(mockTx.standings.update).toHaveBeenCalledWith({
      where: { id: localStanding.id },
      data: expect.objectContaining({
        points: { decrement: 3 },
      }),
    });
    expect(mockTx.match.delete).toHaveBeenCalledWith({ where: { id: matchId } });
    expect(response.ok).toBe(true);
  });

  test('Should return a "not found" error on missing records (P2001)', async () => {
    mockTx.match.delete.mockRejectedValue(
      new MockPrismaClientKnownRequestError('Record not found', {
        code: 'P2001',
        meta: { modelName: 'Match', target: ['id'] },
      }),
    );

    const response = await deleteMatchAction(matchId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/el campo "id" no existe/i);
  });

  test('Should return error on duplicate fields (P2002)', async () => {
    mockTx.match.delete.mockRejectedValue(
      new MockPrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        meta: { modelName: 'Match', target: ['id'] },
      }),
    );

    const response = await deleteMatchAction(matchId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/el campo "id" está duplicado/i);
  });

  test('Should return a generic prisma error for other codes', async () => {
    mockTx.match.delete.mockRejectedValue(
      new MockPrismaClientKnownRequestError('Foreign key constraint failed', {
        code: 'P2003',
        meta: { modelName: 'Match' },
      }),
    );

    const response = await deleteMatchAction(matchId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/error al eliminar el encuentro/i);
  });

  test('Should return an error on unexpected Error instance', async () => {
    mockTx.match.delete.mockRejectedValue(new Error('Something went wrong'));

    const response = await deleteMatchAction(matchId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/error inesperado/i);
  });
});
