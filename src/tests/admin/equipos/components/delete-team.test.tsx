import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DeleteTeam } from '@/app/admin/equipos/(components)/delete-team';
import { deleteTeamAction } from '@/app/admin/equipos/(actions)';

vi.mock('@/app/admin/equipos/(actions)', () => ({
  deleteTeamAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const teamId = '550e8400-e29b-41d4-a716-446655440001';

const renderComponent = (roles: string[] = ['admin']) => {
  render(
    <TooltipProvider>
      <DeleteTeam teamId={teamId} roles={roles} />
    </TooltipProvider>,
  );

  const user = userEvent.setup();
  const trigger = screen.getByRole('button');

  return { user, trigger };
};

describe('Test on <DeleteTeam /> component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(deleteTeamAction).mockResolvedValue({
      ok: true,
      message: 'El equipo ha sido eliminado correctamente',
    });
  });

  test('Should render the delete button and the tooltip', async () => {
    const { user, trigger } = renderComponent();

    expect(trigger).toBeInTheDocument();

    await user.hover(trigger);

    const tooltip = screen.getByRole('tooltip');

    expect(tooltip).toHaveTextContent(/eliminar/i);
  });

  test('Should open the confirmation dialog', async () => {
    const { user, trigger } = renderComponent();

    await user.click(trigger);

    expect(
      screen.getByText(/estas seguro de eliminar el equipo/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/esta acción no se puede deshacer/i),
    ).toBeInTheDocument();
  });

  test('Should show a permissions error when the user is not an admin', async () => {
    const { toast } = await import('sonner');
    const { user, trigger } = renderComponent([]);

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }));

    expect(toast.error).toHaveBeenCalledWith(
      'No tienes permisos administrativos para eliminar equipos',
    );
    expect(deleteTeamAction).not.toHaveBeenCalled();
  });

  test('Should delete the team when the user is an admin', async () => {
    const { toast } = await import('sonner');
    const { user, trigger } = renderComponent();

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }));

    expect(deleteTeamAction).toHaveBeenCalledWith(teamId);
    expect(toast.success).toHaveBeenCalledWith(
      'El equipo ha sido eliminado correctamente',
    );
  });

  test('Should show an error toast when deletion fails', async () => {
    vi.mocked(deleteTeamAction).mockResolvedValue({
      ok: false,
      message: 'No se puede eliminar el equipo porque tiene jugadores registrados',
    });
    const { toast } = await import('sonner');
    const { user, trigger } = renderComponent();

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }));

    expect(toast.error).toHaveBeenCalledWith('Error', expect.objectContaining({
      duration: 6000,
    }));
  });

  test('Should close the dialog without deleting when cancel is clicked', async () => {
    const { user, trigger } = renderComponent();

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(deleteTeamAction).not.toHaveBeenCalled();
    expect(
      screen.queryByText(/estas seguro de eliminar el equipo/i),
    ).not.toBeInTheDocument();
  });
});
