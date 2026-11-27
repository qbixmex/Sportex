import { act, renderHook } from '@testing-library/react';
import type z from 'zod';
import { useEditTeam } from '@/app/admin/equipos/editar/[id]/use-edit-team';
import { ROUTES } from '@/shared/constants/routes';
import type { editTeamSchema } from '@/shared/schemas';
import { teamMock, teamWithoutRelationsMock } from '../mocks/team.mock';

type UpdatedTeam = {
  id: string;
  tournament: { name: string; permalink: string; } | null;
  category: { id: string; name: string; permalink: string } | null;
} & Record<string, unknown>;

const { mockReplace, mockUpdateAction } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockUpdateAction: vi.fn<
    (args: { formData: FormData; teamId: string }) => Promise<{
      ok: boolean;
      message: string;
      updatedTeam: UpdatedTeam | null;
    }>
  >(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/app/admin/equipos/(actions)', () => ({
  updateTeamAction: mockUpdateAction,
}));

type EditTeamFormValues = z.infer<typeof editTeamSchema>;

const validData: EditTeamFormValues = {
  name: '  Águilas actualizadas  ',
  permalink: '  aguilas-actualizadas  ',
  format: '9',
  gender: 'female',
  country: '  México  ',
  state: '  Jalisco  ',
  city: '  Guadalajara  ',
  coachId: '  b7e2ca32-af95-4750-bf63-6a338b236097  ',
  emails: ['aguilas@example.com'],
  address: '  Calle Falsa 123, Colonia Centro  ',
  fieldsIds: ['880e8400-e29b-41d4-a716-446655440004'],
  active: false,
  categoryId: '770e8400-e29b-41d4-a716-446655440003',
  tournamentId: '660e8400-e29b-41d4-a716-446655440002',
};

const updatedTeamMock: UpdatedTeam = {
  id: teamMock.id,
  tournament: { name: 'Torneo Verano', permalink: 'torneo-verano' },
  category: {
    id: '770e8400-e29b-41d4-a716-446655440003',
    name: 'Varonil',
    permalink: 'varonil',
  },
};

describe('Tests on useEditTeam hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateAction.mockResolvedValue({
      ok: true,
      message: 'El equipo fue actualizado correctamente',
      updatedTeam: updatedTeamMock,
    });
  });

  test('Should initialize form with the team values', () => {
    const { result } = renderHook(() => useEditTeam({ team: teamMock }));

    const values = result.current.form.getValues();

    expect(values.name).toBe(teamMock.name);
    expect(values.permalink).toBe(teamMock.permalink);
    expect(values.format).toBe(teamMock.format);
    expect(values.gender).toBe(teamMock.gender);
    expect(values.country).toBe(teamMock.country);
    expect(values.state).toBe(teamMock.state);
    expect(values.city).toBe(teamMock.city);
    expect(values.coachId).toBe(teamMock.coachId);
    expect(values.emails).toEqual(teamMock.emails);
    expect(values.address).toBe(teamMock.address);
    expect(values.fieldsIds).toEqual(teamMock.fieldsIds);
    expect(values.active).toBe(teamMock.active);
    expect(values.categoryId).toBe(teamMock.category?.id);
    expect(values.tournamentId).toBe(teamMock.tournament?.id);
  });

  test('Should trim name before sending', async () => {
    const { result } = renderHook(() => useEditTeam({ team: teamMock }));

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    const { formData } = mockUpdateAction.mock.calls[0][0];

    expect(formData.get('name')).toBe('Águilas actualizadas');
  });

  test('Should trim name permalink before sending', async () => {
    const { result } = renderHook(() => useEditTeam({ team: teamMock }));

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    const { formData } = mockUpdateAction.mock.calls[0][0];

    expect(formData.get('permalink')).toBe('aguilas-actualizadas');
  });

  test('Should append all form fields to FormData', async () => {
    const { result } = renderHook(() => useEditTeam({ team: teamMock }));

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    const { formData } = mockUpdateAction.mock.calls[0][0];

    expect(formData.get('categoryId')).toBe(validData.categoryId);
    expect(formData.get('format')).toBe(validData.format);
    expect(formData.get('gender')).toBe(validData.gender);
    expect(formData.get('tournamentId')).toBe(validData.tournamentId);
    expect(formData.get('country')).toBe('México');
    expect(formData.get('state')).toBe('Jalisco');
    expect(formData.get('city')).toBe('Guadalajara');
    expect(formData.get('coachId')).toBe(validData.coachId?.trim());
    expect(formData.get('emails')).toBe(JSON.stringify(validData.emails));
    expect(formData.get('address')).toBe(validData.address?.trim());
    expect(formData.get('fieldsIds')).toBe(JSON.stringify(validData.fieldsIds));
    expect(formData.get('active')).toBe(String(validData.active));
  });

  test('Should append image when a File is provided', async () => {
    const { result } = renderHook(() => useEditTeam({ team: teamMock }));
    const image = new File(['image'], 'team.png', { type: 'image/png' });

    await act(async () => {
      await result.current.onSubmit({ ...validData, image });
    });

    const { formData } = mockUpdateAction.mock.calls[0][0];

    expect(formData.get('image')).toBe(image);
  });

  test('Should not append image when no File is provided', async () => {
    const { result } = renderHook(() => useEditTeam({ team: teamMock }));

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    const { formData } = mockUpdateAction.mock.calls[0][0];

    expect(formData.get('image')).toBeNull();
  });

  test('Should update the team and navigate when relations exist', async () => {
    const { result } = renderHook(() => useEditTeam({ team: teamMock }));

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    expect(mockUpdateAction).toHaveBeenCalledWith({
      formData: expect.any(FormData),
      teamId: teamMock.id,
    });
    expect(mockReplace).toHaveBeenCalledWith(
      `${ROUTES.ADMIN_TEAMS}?tournament=torneo-verano&category=varonil`,
    );
  });

  test('Should not navigate when the updated team has no relations', async () => {
    mockUpdateAction.mockResolvedValue({
      ok: true,
      message: 'El equipo fue actualizado correctamente',
      updatedTeam: {
        ...updatedTeamMock,
        tournament: null,
        category: null,
      },
    });
    const { result } = renderHook(() => useEditTeam({ team: teamMock }));

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('Should show an error toast and not navigate when update fails', async () => {
    mockUpdateAction.mockResolvedValue({
      ok: false,
      message: 'Error al actualizar el equipo',
      updatedTeam: null,
    });
    const { toast } = await import('sonner');
    const { result } = renderHook(() => useEditTeam({ team: teamMock }));

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    expect(toast.error).toHaveBeenCalledWith('Error al actualizar el equipo');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('Should navigate back with the team tournament and category', () => {
    const { result } = renderHook(() => useEditTeam({ team: teamMock }));

    act(() => {
      result.current.handleNavigateBack();
    });

    expect(mockReplace).toHaveBeenCalledWith(
      `${ROUTES.ADMIN_TEAMS}?tournament=torneo-a&category=varonil`,
    );
  });

  test('Should navigate back to the teams list when the team has no relations', () => {
    const { result } = renderHook(() =>
      useEditTeam({ team: teamWithoutRelationsMock }),
    );

    act(() => {
      result.current.handleNavigateBack();
    });

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.ADMIN_TEAMS);
  });
});
