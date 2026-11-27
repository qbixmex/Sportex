const {
  MockPrismaClientKnownRequestError,
  mockRequireAdmin,
  mockTransaction,
  mockUploadImage,
  mockDeleteImage,
  mockUpdateTag,
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
  return {
    MockPrismaClientKnownRequestError,
    mockRequireAdmin: vi.fn(),
    mockTransaction: vi.fn(),
    mockUploadImage: vi.fn(),
    mockDeleteImage: vi.fn(),
    mockUpdateTag: vi.fn(),
  };
});

vi.mock('next/cache', () => ({
  updateTag: mockUpdateTag,
}));

vi.mock('@/lib/get-session', () => ({
  requireAdmin: mockRequireAdmin,
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    $transaction: mockTransaction,
  },
}));

vi.mock('@/shared/actions', () => ({
  uploadImage: mockUploadImage,
  deleteImage: mockDeleteImage,
}));

vi.mock('@/generated/prisma/client', () => ({
  Prisma: {
    PrismaClientKnownRequestError: MockPrismaClientKnownRequestError,
  },
}));

import { updateTeamAction } from '@/app/admin/equipos/(actions)/updateTeamAction';

const teamId = '550e8400-e29b-41d4-a716-446655440001';
const categoryId = '770e8400-e29b-41d4-a716-446655440003';
const tournamentId = '660e8400-e29b-41d4-a716-446655440002';
const coachId = 'b7e2ca32-af95-4750-bf63-6a338b236097';
const fieldId = '880e8400-e29b-41d4-a716-446655440004';

const validFormData = (): FormData => {
  const formData = new FormData();
  formData.append('name', 'Águilas FC');
  formData.append('permalink', 'aguilas-fc');
  formData.append('format', '11');
  formData.append('gender', 'male');
  formData.append('categoryId', categoryId);
  formData.append('tournamentId', tournamentId);
  formData.append('country', 'México');
  formData.append('state', 'Jalisco');
  formData.append('city', 'Guadalajara');
  formData.append('coachId', coachId);
  formData.append('emails', JSON.stringify(['aguilas@example.com']));
  formData.append('address', 'Calle Falsa 123, Colonia Centro');
  formData.append('fieldsIds', JSON.stringify([fieldId]));
  formData.append('active', 'true');
  return formData;
};

const mockUpdatedTeam = {
  id: teamId,
  name: 'Águilas FC',
  permalink: 'aguilas-fc',
  format: '11',
  gender: 'male',
  country: 'México',
  state: 'Jalisco',
  city: 'Guadalajara',
  coachId,
  emails: ['aguilas@example.com'],
  address: 'Calle Falsa 123, Colonia Centro',
  imageUrl: null as string | null,
  imagePublicID: null as string | null,
  active: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-15'),
  tournament: { permalink: 'torneo-a' },
  category: {
    id: categoryId,
    name: 'Varonil',
    permalink: 'varonil',
  },
};

const mockTx = {
  team: {
    count: vi.fn(),
    update: vi.fn(),
  },
  teamField: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
};

describe('Tests on updateTeamAction server action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => { });
    mockRequireAdmin.mockResolvedValue({
      ok: true,
      session: { user: { id: 'user-1', roles: ['admin'] } },
    });
    mockTx.team.count.mockResolvedValue(1);
    mockTx.team.update.mockResolvedValue(mockUpdatedTeam);
    mockTx.teamField.deleteMany.mockResolvedValue({ count: 1 });
    mockTx.teamField.createMany.mockResolvedValue({ count: 1 });
    mockTransaction.mockImplementation(
      (cb: (tx: typeof mockTx) => unknown) => cb(mockTx),
    );
    mockUploadImage.mockResolvedValue({
      secureUrl: 'https://cloudinary.com/new-team.jpg',
      publicId: 'new-team-public-id',
    });
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

    const response = await updateTeamAction({
      teamId,
      formData: validFormData(),
    });

    expect(response.ok).toBe(false);
    expect(response.message).toBe(
      'No tienes permisos administrativos para realizar esta acción',
    );
    expect(response.updatedTeam).toBeNull();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return a validation error when the name is empty', async () => {
    const formData = validFormData();
    formData.set('name', '');

    const response = await updateTeamAction({ teamId, formData });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/es obligatorio/i);
    expect(response.updatedTeam).toBeNull();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return a validation error when the name is too short', async () => {
    const formData = validFormData();
    formData.set('name', 'ab');

    const response = await updateTeamAction({ teamId, formData });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/debe ser mayor a 3 caracteres/i);
    expect(response.updatedTeam).toBeNull();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return a validation error when the name is too long', async () => {
    const formData = validFormData();
    formData.set('name', 'x'.repeat(251));

    const response = await updateTeamAction({ teamId, formData });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/debe ser menor a 250 caracteres/i);
    expect(response.updatedTeam).toBeNull();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return an error when the team does not exist', async () => {
    mockTx.team.count.mockResolvedValue(0);

    const response = await updateTeamAction({
      teamId,
      formData: validFormData(),
    });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/no existe/i);
    expect(response.updatedTeam).toBeNull();
    expect(mockTx.team.update).not.toHaveBeenCalled();
  });

  test('Should update a team without image', async () => {
    const response = await updateTeamAction({
      teamId,
      formData: validFormData(),
    });

    expect(response.ok).toBe(true);
    expect(response.message).toMatch(/correctamente/i);
    expect(response.updatedTeam?.id).toBe(teamId);

    expect(mockTx.team.update).toHaveBeenCalledOnce();
    expect(mockTx.team.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: teamId },
        data: expect.objectContaining({
          name: 'Águilas FC',
          permalink: 'aguilas-fc',
          format: '11',
          gender: 'male',
          country: 'México',
          state: 'Jalisco',
          city: 'Guadalajara',
          coachId,
          emails: ['aguilas@example.com'],
          address: 'Calle Falsa 123, Colonia Centro',
          active: true,
          categoryId,
          tournamentId,
        }),
      }),
    );
    expect(mockTx.teamField.deleteMany).toHaveBeenCalledWith({
      where: { teamId },
    });
    expect(mockTx.teamField.createMany).toHaveBeenCalledWith({
      data: [{ teamId, fieldId }],
    });
    expect(mockUploadImage).not.toHaveBeenCalled();
    expect(mockDeleteImage).not.toHaveBeenCalled();
    expect(mockUpdateTag).toHaveBeenCalledWith('admin-teams');
  });

  test('Should not touch fields when fieldsIds is not provided', async () => {
    const formData = validFormData();
    formData.delete('fieldsIds');

    const response = await updateTeamAction({ teamId, formData });

    expect(response.ok).toBe(true);
    expect(mockTx.teamField.deleteMany).not.toHaveBeenCalled();
    expect(mockTx.teamField.createMany).not.toHaveBeenCalled();
  });

  test('Should replace the team image when a new one is provided', async () => {
    mockTx.team.update.mockResolvedValue({
      ...mockUpdatedTeam,
      imageUrl: 'https://cloudinary.com/old-team.jpg',
      imagePublicID: 'old-team-public-id',
    });
    const image = new File(['image'], 'team.png', { type: 'image/png' });
    const formData = validFormData();
    formData.append('image', image);

    const response = await updateTeamAction({ teamId, formData });

    expect(response.ok).toBe(true);
    expect(mockDeleteImage).toHaveBeenCalledWith('old-team-public-id');
    expect(mockUploadImage).toHaveBeenCalledWith(image, 'teams');
    expect(mockTx.team.update).toHaveBeenCalledTimes(2);
    expect(mockTx.team.update).toHaveBeenLastCalledWith({
      where: { id: teamId },
      data: {
        imageUrl: 'https://cloudinary.com/new-team.jpg',
        imagePublicID: 'new-team-public-id',
      },
    });
    expect(response.updatedTeam?.imageUrl).toBe(
      'https://cloudinary.com/new-team.jpg',
    );
    expect(response.updatedTeam?.imagePublicID).toBe('new-team-public-id');
  });

  test('Should upload an image when the team had no previous image', async () => {
    const image = new File(['image'], 'team.png', { type: 'image/png' });
    const formData = validFormData();
    formData.append('image', image);

    const response = await updateTeamAction({ teamId, formData });

    expect(response.ok).toBe(true);
    expect(mockDeleteImage).not.toHaveBeenCalled();
    expect(mockUploadImage).toHaveBeenCalledWith(image, 'teams');
    expect(mockTx.team.update).toHaveBeenCalledTimes(2);
  });

  test('Should return an error when deleting the previous image fails', async () => {
    mockTx.team.update.mockResolvedValue({
      ...mockUpdatedTeam,
      imageUrl: 'https://cloudinary.com/old-team.jpg',
      imagePublicID: 'old-team-public-id',
    });
    mockDeleteImage.mockResolvedValue({ ok: false });
    const image = new File(['image'], 'team.png', { type: 'image/png' });
    const formData = validFormData();
    formData.append('image', image);

    const response = await updateTeamAction({ teamId, formData });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/error inesperado/i);
    expect(response.updatedTeam).toBeNull();
    expect(mockUploadImage).not.toHaveBeenCalled();
  });

  test('Should return error on prisma known error (P2003)', async () => {
    mockTx.team.count.mockRejectedValue(
      new MockPrismaClientKnownRequestError('Foreign key constraint failed', {
        code: 'P2003',
      }),
    );

    const response = await updateTeamAction({
      teamId,
      formData: validFormData(),
    });

    expect(response.ok).toBe(false);
    expect(response.message).toContain('El equipo no existe');
    expect(response.updatedTeam).toBe(null);
  });

  test('Should return error on generic prisma known error', async () => {
    mockTx.team.count.mockRejectedValue(
      new MockPrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
      }),
    );

    const response = await updateTeamAction({
      teamId,
      formData: validFormData(),
    });

    expect(response.ok).toBe(false);
    expect(response.message).toContain('Error al actualizar el equipo');
    expect(response.updatedTeam).toBe(null);
  });

  test('Should return an unexpected error on unknown failures inside the transaction', async () => {
    mockTx.team.update.mockRejectedValue(new Error('Something went wrong'));

    const response = await updateTeamAction({
      teamId,
      formData: validFormData(),
    });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/error inesperado/i);
    expect(response.updatedTeam).toBeNull();
  });

  test('Should return an unexpected error when the transaction rejects', async () => {
    mockTransaction.mockRejectedValue(new Error('Infrastructure failure'));

    const response = await updateTeamAction({
      teamId,
      formData: validFormData(),
    });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/error inesperado/i);
    expect(response.updatedTeam).toBeNull();
  });
});
