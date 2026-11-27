const {
  mockRequireAdmin,
  mockCount,
  mockUpdate,
  mockUpdateTag,
} = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockCount: vi.fn(),
  mockUpdate: vi.fn(),
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
      count: mockCount,
      update: mockUpdate,
    },
  },
}));

import { updateTeamStateAction } from '@/app/admin/equipos/(actions)/updateTeamStateAction';

const teamId = '550e8400-e29b-41d4-a716-446655440001';

describe('Tests on updateTeamStateAction server action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => { });
    mockRequireAdmin.mockResolvedValue({
      ok: true,
      session: { user: { id: 'user-1', roles: ['admin'] } },
    });
    mockCount.mockResolvedValue(1);
    mockUpdate.mockResolvedValue({ name: 'Águilas', active: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should return an error when the user is not authorized', async () => {
    mockRequireAdmin.mockResolvedValue({
      ok: false,
      message: 'No tienes permisos administrativos para realizar esta acción',
    });

    const response = await updateTeamStateAction(teamId, true);

    expect(response.ok).toBe(false);
    expect(response.message).toBe(
      'No tienes permisos administrativos para realizar esta acción',
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  test('Should return an error when the team does not exist', async () => {
    mockCount.mockResolvedValue(0);

    const response = await updateTeamStateAction(teamId, true);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/no existe/i);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  test('Should activate the team', async () => {
    const response = await updateTeamStateAction(teamId, true);

    expect(response.ok).toBe(true);
    expect(response.message).toContain('activado');
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: teamId },
      data: { active: true },
      select: { name: true, active: true },
    });
    expect(mockUpdateTag).toHaveBeenCalledWith('admin-teams');
  });

  test('Should deactivate the team', async () => {
    mockUpdate.mockResolvedValue({ name: 'Águilas', active: false });

    const response = await updateTeamStateAction(teamId, false);

    expect(response.ok).toBe(true);
    expect(response.message).toContain('desactivado');
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: teamId },
      data: { active: false },
      select: { name: true, active: true },
    });
  });

  test('Should return an error when the team not exists', async () => {
    mockCount.mockRejectedValue(new Error('Database failure'));

    const response = await updateTeamStateAction(teamId, true);

    expect(response.ok).toBe(false);
    expect(response.message).toBe(
      'No se pudo actualizar el equipo, revise los logs del servidor',
    );
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockUpdateTag).not.toHaveBeenCalled();
  });

  test('Should return an error when the team update fails', async () => {
    mockUpdate.mockRejectedValue(new Error('Database failure'));

    const response = await updateTeamStateAction(teamId, true);

    expect(response.ok).toBe(false);
    expect(response.message).toBe(
      'No se pudo actualizar el equipo, revise los logs del servidor',
    );
    expect(mockUpdateTag).not.toHaveBeenCalled();
  });
});
