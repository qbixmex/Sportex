import { render, screen, waitFor } from '@testing-library/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import userEvent from '@testing-library/user-event';
import { DeleteMatch } from '@/app/admin/encuentros/(components)/delete-match';
import { MATCH_STATUS, type MATCH_STATUS_TYPE } from '@/shared/enums';

const { mockRequireAdmin, mockDeleteAction } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockDeleteAction: vi.fn<(id: string) => Promise<{ ok: boolean; message: string }>>(),
}));

vi.mock('@/lib/get-session', () => ({
  requireAdmin: () => mockRequireAdmin(),
}));

vi.mock('@/app/admin/encuentros/(actions)/delete-match.action', () => ({
  deleteMatchAction: (id: string) => mockDeleteAction(id),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const matchId = '0251b9bf-55e5-48fb-ae2c-6fcdad308d13';

describe('Test on <DeleteMatch /> component', () => {
  const renderComponent = (status: MATCH_STATUS_TYPE = MATCH_STATUS.SCHEDULED) => {
    render(
      <DeleteMatch id={matchId} status={status} />,
      { wrapper: TooltipProvider },
    );

    const user = userEvent.setup();
    const triggerButton = () => screen.getByRole('button', { name: /eliminar encuentro/i });
    const confirmButton = () => screen.getByRole('button', { name: /^eliminar$/ });
    const cancelButton = () => screen.getByRole('button', { name: /^cancelar$/ });

    return { user, triggerButton, confirmButton, cancelButton };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ ok: true });
    mockDeleteAction.mockResolvedValue({
      ok: true,
      message: 'El encuentro ha sido eliminado correctamente',
    });
  });

  test('Should render the trigger button with its icon', () => {
    const { triggerButton } = renderComponent();

    expect(triggerButton()).toBeInTheDocument();
    expect(triggerButton().querySelector('svg')).toBeInTheDocument();
  });

  test('Should render the trigger button when the match is completed', () => {
    const { triggerButton } = renderComponent(MATCH_STATUS.COMPLETED);

    expect(triggerButton()).toBeInTheDocument();
    expect(triggerButton().querySelector('svg')).toBeInTheDocument();
  });

  test('Should show the standings warning on a completed match', async () => {
    const { user, triggerButton } = renderComponent(MATCH_STATUS.COMPLETED);

    await user.click(triggerButton());

    expect(screen.getByText(/se re-calcularán los puntos de la tabla/i)).toBeInTheDocument();
  });

  test('Should not show the standings warning on a scheduled match', async () => {
    const { user, triggerButton } = renderComponent(MATCH_STATUS.SCHEDULED);

    await user.click(triggerButton());

    expect(screen.queryByText(/se re-calcularán los puntos de la tabla/i)).not.toBeInTheDocument();
  });

  test('Should allow deleting a completed match', async () => {
    const { user, triggerButton, confirmButton } = renderComponent(MATCH_STATUS.COMPLETED);

    await user.click(triggerButton());
    await user.click(confirmButton());

    await waitFor(() => {
      expect(mockDeleteAction).toHaveBeenCalledWith(matchId);
    });
  });

  test('Should call deleteMatchAction on confirm', async () => {
    const { user, triggerButton, confirmButton } = renderComponent();

    await user.click(triggerButton());
    await user.click(confirmButton());

    await waitFor(() => {
      expect(mockDeleteAction).toHaveBeenCalledWith(matchId);
    });
  });

  test('Should show a success toast on confirm', async () => {
    const { toast } = await import('sonner');
    const { user, triggerButton, confirmButton } = renderComponent();

    await user.click(triggerButton());
    await user.click(confirmButton());

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('El encuentro ha sido eliminado correctamente');
    });
  });

  test('Should show an error toast when the action fails', async () => {
    mockDeleteAction.mockResolvedValue({
      ok: false,
      message: 'No se puede eliminar el encuentro',
    });
    const { toast } = await import('sonner');
    const { user, triggerButton, confirmButton } = renderComponent();

    await user.click(triggerButton());
    await user.click(confirmButton());

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No se puede eliminar el encuentro');
    });
  });

  test('Should not call the action when the user is not admin', async () => {
    mockRequireAdmin.mockResolvedValue({
      ok: false,
      message: 'No tienes permisos administrativos para realizar esta acción',
    });
    const { user, triggerButton, confirmButton } = renderComponent();

    await user.click(triggerButton());
    await user.click(confirmButton());

    await waitFor(() => {
      expect(mockRequireAdmin).toHaveBeenCalled();
    });
    expect(mockDeleteAction).not.toHaveBeenCalled();
  });

  test('Should not call the action when cancel is clicked', async () => {
    const { user, triggerButton, cancelButton } = renderComponent();

    await user.click(triggerButton());
    await user.click(cancelButton());

    expect(mockDeleteAction).not.toHaveBeenCalled();
  });
});
