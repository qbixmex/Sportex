const {
  mockRequireAdmin,
  mockFindFirst,
  mockMatchCount,
  mockStandingsFindMany,
  mockTransaction,
  mockDeleteImage,
  mockUpdateTag,
} = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockFindFirst: vi.fn(),
  mockMatchCount: vi.fn(),
  mockStandingsFindMany: vi.fn(),
  mockTransaction: vi.fn(),
  mockDeleteImage: vi.fn(),
  mockUpdateTag: vi.fn(),
}));

vi.mock('next/cache', () => ({
  updateTag: mockUpdateTag,
}));

vi.mock('@/lib/get-session', () => ({
  requireAdmin: mockRequireAdmin,
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    team: {
      findFirst: mockFindFirst,
    },
    match: {
      count: mockMatchCount,
    },
    standings: {
      findMany: mockStandingsFindMany,
    },
    $transaction: mockTransaction,
  },
}));

vi.mock('@/shared/actions/deleteImageAction', () => ({
  default: mockDeleteImage,
}));

import { deleteTeamAction } from '@/app/admin/equipos/(actions)/deleteTeamAction';

const teamId = '550e8400-e29b-41d4-a716-446655440001';

const teamMock = {
  name: 'Águilas',
  imagePublicID: null as string | null,
  _count: { players: 0 },
};

const zeroStanding = {
  id: 'standings-1',
  matchesPlayed: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalsDifference: 0,
  points: 0,
  additionalPoints: 0,
  totalPoints: 0,
};

const playedStanding = {
  ...zeroStanding,
  id: 'standings-2',
  matchesPlayed: 3,
  wins: 2,
};

const mockTx = {
  standings: {
    deleteMany: vi.fn(),
  },
  team: {
    delete: vi.fn(),
  },
};

describe('Tests on deleteTeamAction server action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockRequireAdmin.mockResolvedValue({
      ok: true,
      session: { user: { id: 'user-1', roles: ['admin'] } },
    });
    mockFindFirst.mockResolvedValue(teamMock);
    mockMatchCount.mockResolvedValue(0);
    mockStandingsFindMany.mockResolvedValue([]);
    mockTx.standings.deleteMany.mockResolvedValue({ count: 1 });
    mockTx.team.delete.mockResolvedValue({ imagePublicID: null });
    mockTransaction.mockImplementation(
      (cb: (tx: typeof mockTx) => unknown) => cb(mockTx),
    );
    mockDeleteImage.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should return an error when the user is not authorized', async () => {
    mockRequireAdmin.mockResolvedValue({
      ok: false,
      message: 'No tienes permisos administrativos para realizar esta acción',
    });

    const response = await deleteTeamAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toBe(
      'No tienes permisos administrativos para realizar esta acción',
    );
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  test('Should return an error when the team does not exist', async () => {
    mockFindFirst.mockResolvedValue(null);

    const response = await deleteTeamAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/no existe/i);
  });

  test('Should not delete a team with registered players', async () => {
    mockFindFirst.mockResolvedValue({
      ...teamMock,
      _count: { players: 2 },
    });

    const response = await deleteTeamAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/jugadores registrados/i);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should not delete a team that appears in matches', async () => {
    mockMatchCount.mockResolvedValue(3);

    const response = await deleteTeamAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/encuentros/i);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should not delete a team with standings statistics', async () => {
    mockStandingsFindMany.mockResolvedValue([playedStanding]);

    const response = await deleteTeamAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/tabla de posiciones/i);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should delete the team without standings rows', async () => {
    const response = await deleteTeamAction(teamId);

    expect(response.ok).toBe(true);
    expect(response.message).toMatch(/eliminado correctamente/i);
    expect(mockTx.standings.deleteMany).not.toHaveBeenCalled();
    expect(mockTx.team.delete).toHaveBeenCalledWith({ where: { id: teamId } });
    expect(mockDeleteImage).not.toHaveBeenCalled();
    expect(mockUpdateTag).toHaveBeenCalledWith('admin-teams');
  });

  test('Should remove the all-zero standings rows before deleting the team', async () => {
    mockStandingsFindMany.mockResolvedValue([zeroStanding]);

    const response = await deleteTeamAction(teamId);

    expect(response.ok).toBe(true);
    expect(response.message).toMatch(/tabla de posiciones/i);
    expect(mockTx.standings.deleteMany).toHaveBeenCalledWith({
      where: { teamId },
    });
    expect(mockTx.team.delete).toHaveBeenCalledWith({ where: { id: teamId } });
  });

  test('Should delete the team image from cloudinary', async () => {
    mockTx.team.delete.mockResolvedValue({ imagePublicID: 'public-id' });

    const response = await deleteTeamAction(teamId);

    expect(response.ok).toBe(true);
    expect(mockDeleteImage).toHaveBeenCalledWith('public-id');
  });

  test('Should return an error when the transaction fails', async () => {
    mockTransaction.mockRejectedValue(new Error('DB failure'));

    const response = await deleteTeamAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/no se pudo eliminar el equipo/i);
  });

  test('Should return an error when fetching the team fails', async () => {
    mockFindFirst.mockRejectedValue(new Error('DB failure'));

    const response = await deleteTeamAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toBe(
      'No se pudo eliminar el equipo, revise los logs del servidor',
    );
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return an error when counting matches fails', async () => {
    mockMatchCount.mockRejectedValue(new Error('DB failure'));

    const response = await deleteTeamAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toBe(
      'No se pudo eliminar el equipo, revise los logs del servidor',
    );
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return an error when fetching standings fails', async () => {
    mockStandingsFindMany.mockRejectedValue(new Error('DB failure'));

    const response = await deleteTeamAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toBe(
      'No se pudo eliminar el equipo, revise los logs del servidor',
    );
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return an error when the image deletion fails', async () => {
    mockTx.team.delete.mockResolvedValue({ imagePublicID: 'public-id' });
    mockDeleteImage.mockResolvedValue({ ok: false });

    const response = await deleteTeamAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/no se pudo eliminar su imagen/i);
    expect(mockUpdateTag).not.toHaveBeenCalled();
  });
});
