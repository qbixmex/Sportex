import { act, renderHook } from '@testing-library/react';
import { useCreateTeam } from '@/app/admin/equipos/crear/use-create-team';
import { ROUTES } from '@/shared/constants/routes';
import type { createTeamSchema } from '@/shared/schemas';
import { createdTeamMock, teamMock } from '../mocks/team.mock';
import type z from 'zod';

const {
  mockReplace,
  mockCreateAction,
  mockAddToStandings,
  mockSearchParams,
} = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockCreateAction: vi.fn<
    (args: { formData: FormData }) => Promise<{
      ok: boolean;
      message: string;
      team: typeof createdTeamMock | null;
    }>
  >(),
  mockAddToStandings: vi.fn<
    (args: { tournamentId: string; teamId: string }) => Promise<{ ok: boolean }>
  >(),
  mockSearchParams: { current: new URLSearchParams() },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams.current,
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/app/admin/equipos/(actions)', () => ({
  createTeamAction: mockCreateAction,
  addTeamToStandingsAction: mockAddToStandings,
}));

type CreateTeamFormValues = z.infer<typeof createTeamSchema>;

const validData: CreateTeamFormValues = {
  name: '  American School  ',
  permalink: '  american-school  ',
  format: '9',
  gender: 'male',
  country: '  México  ',
  state: '  Jalisco  ',
  city: '  Guadalajara  ',
  coachId: '  b7e2ca32-af95-4750-bf63-6a338b236097  ',
  emails: ['test@example.com'],
  address: '  Calle Falsa 123, Colonia Centro  ',
  fieldsIds: ['880e8400-e29b-41d4-a716-446655440004'],
  active: true,
  categoryId: '770e8400-e29b-41d4-a716-446655440003',
  tournamentId: '660e8400-e29b-41d4-a716-446655440002',
};

describe('Tests on useCreateTeam hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.current = new URLSearchParams();
    mockCreateAction.mockResolvedValue({
      ok: true,
      message: 'Equipo creado satisfactoriamente',
      team: createdTeamMock,
    });
    mockAddToStandings.mockResolvedValue({ ok: true });
  });

  test('Should initialize form with default values', () => {
    const { result } = renderHook(() => useCreateTeam());

    const values = result.current.form.getValues();

    expect(values.name).toBe('');
    expect(values.permalink).toBe('');
    expect(values.format).toBe('');
    expect(values.gender).toBeUndefined();
    expect(values.country).toBe('');
    expect(values.state).toBe('');
    expect(values.city).toBe('');
    expect(values.coachId).toBe('');
    expect(values.emails).toEqual([]);
    expect(values.address).toBe('');
    expect(values.fieldsIds).toEqual([]);
    expect(values.active).toBe(false);
    expect(values.categoryId).toBe('');
    expect(values.tournamentId).toBe('');
  });

  test('Should trim name before sending them', async () => {
    const { result } = renderHook(() => useCreateTeam());

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    const { formData } = mockCreateAction.mock.calls[0][0];

    expect(formData.get('name')).toBe('American School');
  });

  test('Should trim permalink before sending them', async () => {
    const { result } = renderHook(() => useCreateTeam());

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    const { formData } = mockCreateAction.mock.calls[0][0];

    expect(formData.get('permalink')).toBe('american-school');
  });

  test('Should append all form fields to FormData', async () => {
    const { result } = renderHook(() => useCreateTeam());

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    const { formData } = mockCreateAction.mock.calls[0][0];

    expect(formData.get('name')).toBe(validData.name.trim());
    expect(formData.get('permalink')).toBe(validData.permalink.trim());
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
    const { result } = renderHook(() => useCreateTeam());
    const image = new File(['image'], 'team.png', { type: 'image/png' });

    await act(async () => {
      await result.current.onSubmit({ ...validData, image });
    });

    const { formData } = mockCreateAction.mock.calls[0][0];

    expect(formData.get('image')).toBe(image);
  });

  test('Should not append image when no File is provided', async () => {
    const { result } = renderHook(() => useCreateTeam());

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    const { formData } = mockCreateAction.mock.calls[0][0];

    expect(formData.get('image')).toBeNull();
  });

  test('Should add the team to standings when tournamentId is present', async () => {
    const { result } = renderHook(() => useCreateTeam());

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    expect(mockAddToStandings).toHaveBeenCalledWith({
      tournamentId: validData.tournamentId,
      teamId: createdTeamMock.id,
    });
  });

  test('Should not add the team to standings when tournamentId is missing', async () => {
    const { result } = renderHook(() => useCreateTeam());

    await act(async () => {
      await result.current.onSubmit({ ...validData, tournamentId: '' });
    });

    expect(mockAddToStandings).not.toHaveBeenCalled();
  });

  test('Should show success toast, reset the form and navigate on success', async () => {
    const { toast } = await import('sonner');
    const { result } = renderHook(() => useCreateTeam());

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    expect(toast.success).toHaveBeenCalledWith('Equipo creado satisfactoriamente');
    expect(result.current.form.getValues('name')).toBe('');
    expect(result.current.form.getValues('permalink')).toBe('');
    expect(mockReplace).toHaveBeenCalledWith(
      `${ROUTES.ADMIN_TEAMS}?tournament=torneo-verano&category=varonil`,
    );
  });

  test('Should navigate to the teams list when the created team has no relations', async () => {
    mockCreateAction.mockResolvedValue({
      ok: true,
      message: 'Equipo creado satisfactoriamente',
      team: { ...createdTeamMock, tournament: null, category: null },
    });
    const { result } = renderHook(() => useCreateTeam());

    await act(async () => {
      await result.current.onSubmit({ ...validData, tournamentId: '' });
    });

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.ADMIN_TEAMS);
  });

  test('Should show an error toast and not navigate when creation fails', async () => {
    mockCreateAction.mockResolvedValue({
      ok: false,
      message: 'Error al crear el equipo',
      team: null,
    });
    const { toast } = await import('sonner');
    const { result } = renderHook(() => useCreateTeam());

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    expect(toast.error).toHaveBeenCalledWith('Error al crear el equipo');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('Should navigate back with the current tournament and category filters', () => {
    mockSearchParams.current = new URLSearchParams(
      'tournament=torneo-verano&category=varonil',
    );
    const { result } = renderHook(() => useCreateTeam());

    act(() => {
      result.current.handleNavigateBack();
    });

    expect(mockReplace).toHaveBeenCalledWith(
      `${ROUTES.ADMIN_TEAMS}?tournament=torneo-verano&category=varonil`,
    );
  });

  test('Should navigate back to the teams list when there are no filters', () => {
    const { result } = renderHook(() => useCreateTeam());

    act(() => {
      result.current.handleNavigateBack();
    });

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.ADMIN_TEAMS);
  });

  test('Should reset the form when navigating back', () => {
    const { result } = renderHook(() => useCreateTeam());

    act(() => {
      result.current.form.setValue('name', teamMock.name);
      result.current.handleNavigateBack();
    });

    expect(result.current.form.getValues('name')).toBe('');
  });
});
