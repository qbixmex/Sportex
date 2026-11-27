const {
  mockRequireAdmin,
  mockTransaction,
  mockUploadImage,
  mockUpdateTag,
} = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockTransaction: vi.fn(),
  mockUploadImage: vi.fn(),
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
    $transaction: mockTransaction,
  },
}));

vi.mock('@/shared/actions', () => ({
  uploadImage: mockUploadImage,
}));

import { createTeamAction } from '@/app/admin/equipos/(actions)/createTeamAction';

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

const mockCreatedTeam = {
  id: '550e8400-e29b-41d4-a716-446655440001',
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
  imageUrl: null,
  imagePublicID: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-15'),
  tournament: { name: 'Torneo A', permalink: 'torneo-a' },
  category: { name: 'Varonil', permalink: 'varonil' },
};

const mockTx = {
  team: {
    create: vi.fn(),
  },
  teamField: {
    createMany: vi.fn(),
  },
};

describe('Tests on createTeamAction server action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mockRequireAdmin.mockResolvedValue({
      ok: true,
      session: { user: { id: 'user-1', roles: ['admin'] } },
    });
    mockTx.team.create.mockResolvedValue(mockCreatedTeam);
    mockTx.teamField.createMany.mockResolvedValue({ count: 1 });
    mockTransaction.mockImplementation(
      (cb: (tx: typeof mockTx) => unknown) => cb(mockTx),
    );
    mockUploadImage.mockResolvedValue({
      secureUrl: 'https://cloudinary.com/team.jpg',
      publicId: 'team-public-id',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should return an error when the user is not authorized', async () => {
    mockRequireAdmin.mockResolvedValue({
      ok: false,
      message: 'No tienes permisos administrativos para realizar esta acción',
    });

    const response = await createTeamAction({ formData: validFormData() });

    expect(response.ok).toBe(false);
    expect(response.message).toBe(
      'No tienes permisos administrativos para realizar esta acción',
    );
    expect(response.team).toBeNull();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return a validation error when the name is empty', async () => {
    const formData = validFormData();
    formData.set('name', '');

    const response = await createTeamAction({ formData });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/es obligatorio/i);
    expect(response.team).toBeNull();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return a validation error when the name is too short', async () => {
    const formData = validFormData();
    formData.set('name', 'ab');

    const response = await createTeamAction({ formData });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/debe ser mayor a 3 caracteres/i);
    expect(response.team).toBeNull();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return a validation error when the permalink is empty', async () => {
    const formData = validFormData();
    formData.set('permalink', '');

    const response = await createTeamAction({ formData });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/es obligatorio/i);
    expect(response.team).toBeNull();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return a validation error when the permalink is too short', async () => {
    const formData = validFormData();
    formData.set('permalink', 'ab');

    const response = await createTeamAction({ formData });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/debe ser mayor a 3 caracteres/i);
    expect(response.team).toBeNull();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return a validation error when the permalink is too large', async () => {
    const formData = validFormData();
    formData.set('permalink', 'a'.repeat(251));

    const response = await createTeamAction({ formData });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/debe ser menor a 250 caracteres/i);
    expect(response.team).toBeNull();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return a validation error when the permalink contains spaces', async () => {
    const formData = validFormData();
    formData.set('permalink', 'permalink con espacios');

    const response = await createTeamAction({ formData });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/no debe contener espacios/i);
    expect(response.team).toBeNull();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return a validation error when the permalink contains accents', async () => {
    const formData = validFormData();
    formData.set('permalink', 'torneo-acción');

    const response = await createTeamAction({ formData });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/no debe contener acentos/i);
    expect(response.team).toBeNull();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return a validation error when the permalink contains "ñ"', async () => {
    const formData = validFormData();
    formData.set('permalink', 'torneo-niños');

    const response = await createTeamAction({ formData });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/no debe contener la letra ñ/i);
    expect(response.team).toBeNull();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should return a validation error when the permalink contains special characters', async () => {
    const formData = validFormData();
    formData.set('permalink', 'torneo@verano');

    const response = await createTeamAction({ formData });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/solo puede contener letras, números, guiones y guiones bajos/i);
    expect(response.team).toBeNull();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  test('Should create a team without image', async () => {
    const response = await createTeamAction({ formData: validFormData() });

    expect(response.ok).toBe(true);
    expect(response.message).toMatch(/satisfactoriamente/i);
    expect(response.team?.id).toBe(mockCreatedTeam.id);

    expect(mockTx.team.create).toHaveBeenCalledOnce();
    expect(mockTx.team.create).toHaveBeenCalledWith(
      expect.objectContaining({
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
    expect(mockTx.teamField.createMany).toHaveBeenCalledWith({
      data: [{ teamId: mockCreatedTeam.id, fieldId }],
    });
    expect(mockUploadImage).not.toHaveBeenCalled();
    expect(mockUpdateTag).toHaveBeenCalledWith('admin-teams');
  });

  test('Should create a team with image', async () => {
    const image = new File(['image'], 'team.png', { type: 'image/png' });
    const formData = validFormData();
    formData.append('image', image);

    const response = await createTeamAction({ formData });

    expect(response.ok).toBe(true);
    expect(mockUploadImage).toHaveBeenCalledWith(image, 'teams');
    expect(mockTx.team.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          imageUrl: 'https://cloudinary.com/team.jpg',
          imagePublicID: 'team-public-id',
        }),
      }),
    );
  });

  test('Should reject when the image upload fails', async () => {
    mockUploadImage.mockResolvedValue(null);
    const image = new File(['image'], 'team.png', { type: 'image/png' });
    const formData = validFormData();
    formData.append('image', image);

    await expect(createTeamAction({ formData })).rejects.toThrow(
      'Error subiendo imagen a cloudinary',
    );
  });

  test('Should return an unexpected error on unknown failures', async () => {
    mockTransaction.mockRejectedValue(new Error('Something went wrong'));

    const response = await createTeamAction({ formData: validFormData() });

    expect(response.ok).toBe(false);
    expect(response.message).toMatch(/error inesperado/i);
    expect(response.team).toBeNull();
  });
});
