import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerateGenericPlayers } from '@/app/admin/equipos/(components)/generate-generic-players';
import { generatePlayersAction } from '@/app/admin/equipos/(actions)/generate-generic-players';

vi.mock('@/app/admin/equipos/(actions)/generate-generic-players', () => ({
  generatePlayersAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const teamId = '550e8400-e29b-41d4-a716-446655440001';

describe('Test on <GenerateGenericPlayers /> component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generatePlayersAction).mockResolvedValue({
      ok: true,
      message: 'Jugadores generados correctamente',
    });
  });

  test('Should render the button', () => {
    render(<GenerateGenericPlayers teamId={teamId} gender="male" />);

    expect(
      screen.getByRole('button', { name: /generar jugadores genéricos/i }),
    ).toBeInTheDocument();
  });

  test('Should call the action with the team id and gender', async () => {
    const user = userEvent.setup();
    render(<GenerateGenericPlayers teamId={teamId} gender="female" />);

    await user.click(
      screen.getByRole('button', { name: /generar jugadores genéricos/i }),
    );

    expect(generatePlayersAction).toHaveBeenCalledWith({
      teamId,
      gender: 'female',
    });
  });

  test('Should show a success toast', async () => {
    const { toast } = await import('sonner');
    const user = userEvent.setup();
    render(<GenerateGenericPlayers teamId={teamId} gender="male" />);

    await user.click(
      screen.getByRole('button', { name: /generar jugadores genéricos/i }),
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Jugadores generados correctamente',
      );
    });
  });

  test('Should show an error toast when generation fails', async () => {
    vi.mocked(generatePlayersAction).mockResolvedValue({
      ok: false,
      message: 'Error al generar los jugadores',
    });
    const { toast } = await import('sonner');
    const user = userEvent.setup();
    render(<GenerateGenericPlayers teamId={teamId} gender="male" />);

    await user.click(
      screen.getByRole('button', { name: /generar jugadores genéricos/i }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Error al generar los jugadores',
      );
    });
  });

  test('Should show the loading state while generating', async () => {
    let resolveAction: (value: { ok: boolean; message: string }) => void;
    vi.mocked(generatePlayersAction).mockReturnValue(
      new Promise((resolve) => {
        resolveAction = resolve;
      }) as never,
    );
    const user = userEvent.setup();
    render(<GenerateGenericPlayers teamId={teamId} gender="male" />);

    await user.click(
      screen.getByRole('button', { name: /generar jugadores genéricos/i }),
    );

    expect(screen.getByText(/generando/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();

    await act(async () => {
      resolveAction!({ ok: true, message: 'Jugadores generados correctamente' });
    });

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeEnabled();
    });
  });
});
