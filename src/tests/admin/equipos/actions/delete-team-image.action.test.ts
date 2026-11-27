const {
  mockRequireAdmin,
  mockFindFirst,
  mockUpdate,
  mockDeleteImage,
  mockUpdateTag,
} = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockFindFirst: vi.fn(),
  mockUpdate: vi.fn(),
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
      update: mockUpdate,
    },
  },
}));

vi.mock('@/shared/actions/deleteImageAction', () => ({
  default: mockDeleteImage,
}));

import { deleteTeamImageAction } from '@/app/admin/equipos/(actions)/deleteTeamImageAction';

const teamId = '550e8400-e29b-41d4-a716-446655440001';

describe('Tests on deleteTeamImageAction server action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => { });
    mockRequireAdmin.mockResolvedValue({
      ok: true,
      session: { user: { id: 'user-1', roles: ['admin'] } },
    });
    mockFindFirst.mockResolvedValue({
      name: 'Águilas',
      imagePublicID: 'public-id',
    });
    mockUpdate.mockResolvedValue({ id: teamId });
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

    const response = await deleteTeamImageAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toBe(
      'No tienes permisos administrativos para realizar esta acción',
    );
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  test('Should return an error when the team does not exist', async () => {
    mockFindFirst.mockResolvedValue(null);

    const response = await deleteTeamImageAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/no se puede eliminar la imagen/i);
  });

  test('Should clear the image fields and delete the image', async () => {
    const response = await deleteTeamImageAction(teamId);

    expect(response.ok).toBe(true);
    expect(response.message).toMatch(/correctamente/i);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: teamId },
      data: {
        imageUrl: null,
        imagePublicID: null,
      },
    });
    expect(mockDeleteImage).toHaveBeenCalledWith('public-id');
    expect(mockUpdateTag).toHaveBeenCalledWith('admin-teams');
  });

  test('Should not call cloudinary when there is no image', async () => {
    mockFindFirst.mockResolvedValue({
      name: 'Águilas',
      imagePublicID: null,
    });

    const response = await deleteTeamImageAction(teamId);

    expect(response.ok).toBe(true);
    expect(mockDeleteImage).not.toHaveBeenCalled();
  });

  test('Should return an error when the image deletion fails', async () => {
    mockDeleteImage.mockResolvedValue({ ok: false });

    const response = await deleteTeamImageAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/no de cloudinary/i);
    expect(mockUpdateTag).not.toHaveBeenCalled();
  });

  test('Should return an error when fetching the team fails', async () => {
    mockFindFirst.mockRejectedValue(new Error('DB failure'));

    const response = await deleteTeamImageAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toBe(
      'No se pudo eliminar la imagen, revise los logs del servidor',
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  test('Should return an error when updating the team fails', async () => {
    mockUpdate.mockRejectedValue(new Error('DB failure'));

    const response = await deleteTeamImageAction(teamId);

    expect(response.ok).toBe(false);
    expect(response.message).toBe(
      'No se pudo eliminar la imagen, revise los logs del servidor',
    );
    expect(mockDeleteImage).not.toHaveBeenCalled();
    expect(mockUpdateTag).not.toHaveBeenCalled();
  });
});
