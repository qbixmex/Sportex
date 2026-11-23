import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MatchStatus } from '@/app/admin/encuentros/(components)/match-status';
import { type MATCH_STATUS_TYPE, MATCH_STATUS } from '@/shared/enums';

const mockUpdateAction = vi.hoisted(() => vi.fn());
const mockFinishAction = vi.hoisted(() => vi.fn());

vi.mock('@/app/admin/encuentros/(actions)/update-status.action', () => ({
  updateStatusAction: (...args: unknown[]) => mockUpdateAction(...args),
}));

vi.mock('@/app/admin/encuentros/(actions)/finish-match.action', () => ({
  finishMatchAction: (props: unknown) => mockFinishAction(props),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const props = {
  matchId: '0251b9bf-55e5-48fb-ae2c-6fcdad308d13',
  localScore: 2,
  visitorScore: 1,
  localId: '3f24c2e0-7fd2-46e4-94ba-4dd0b557e675',
  visitorId: '99182b8e-143a-479b-8496-24f283e847ae',
};

describe('Test on <MatchStatus /> component', () => {
  const renderComponent = (status: MATCH_STATUS_TYPE) => {
    render(<MatchStatus {...props} status={status} />);

    const user = userEvent.setup();
    const combobox = () => screen.getByRole('combobox', {
      name: 'Estado del encuentro',
    });
    const confirmButton = () => screen.getByRole('button', { name: /proceder/i });
    const cancelButton = () => screen.getByRole('button', { name: /^cancelar$/ });

    return { user, combobox, confirmButton, cancelButton };
  };

  const selectOption = async (
    user: ReturnType<typeof userEvent.setup>,
    combobox: () => HTMLElement,
    name: RegExp,
  ) => {
    await user.click(combobox());
    const option = await screen.findByRole('option', { name });
    await user.click(option);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateAction.mockResolvedValue({
      ok: true,
      message: 'El estado del partido fue actualizado correctamente',
    });
    mockFinishAction.mockResolvedValue({
      ok: true,
      message: 'El estado del partido finalizó correctamente',
    });
  });

  test('Should render the status select', () => {
    const { combobox } = renderComponent(MATCH_STATUS.SCHEDULED);

    expect(combobox()).toBeInTheDocument();
  });

  test('Should render the completed option', async () => {
    const { user, combobox } = renderComponent(MATCH_STATUS.SCHEDULED);

    await user.click(combobox());

    expect(await screen.findByRole('option', { name: /finalizado/i })).toBeInTheDocument();
  });

  test('Should call updateStatusAction when in review status is selected', async () => {
    const { user, combobox } = renderComponent(MATCH_STATUS.SCHEDULED);

    await selectOption(user, combobox, /en revisión/i);

    await waitFor(() => {
      expect(mockUpdateAction).toHaveBeenCalledWith(props.matchId, MATCH_STATUS.IN_REVIEW);
    });
  });

  test('Should call updateStatusAction when in schedule status is selected', async () => {
    const { user, combobox } = renderComponent(MATCH_STATUS.IN_REVIEW);

    await selectOption(user, combobox, /programado/i);

    await waitFor(() => {
      expect(mockUpdateAction).toHaveBeenCalledWith(props.matchId, MATCH_STATUS.SCHEDULED);
    });
  });

  test('Should call updateStatusAction when in progress status is selected', async () => {
    const { user, combobox } = renderComponent(MATCH_STATUS.SCHEDULED);

    await selectOption(user, combobox, /en progreso/i);

    await waitFor(() => {
      expect(mockUpdateAction).toHaveBeenCalledWith(props.matchId, MATCH_STATUS.IN_PROGRESS);
    });
  });

  test('Should call updateStatusAction when canceled status is selected', async () => {
    const { user, combobox } = renderComponent(MATCH_STATUS.IN_PROGRESS);

    await selectOption(user, combobox, /cancelado/i);

    await waitFor(() => {
      expect(mockUpdateAction).toHaveBeenCalledWith(props.matchId, MATCH_STATUS.CANCELED);
    });
  });

  test('Should open the warning dialog and not update the status when completed is selected', async () => {
    const { user, combobox } = renderComponent(MATCH_STATUS.SCHEDULED);

    await selectOption(user, combobox, /finalizado/i);

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/impactará la tabla de posiciones/i)).toBeInTheDocument();
    expect(mockUpdateAction).not.toHaveBeenCalled();
    expect(mockFinishAction).not.toHaveBeenCalled();
  });

  test('Should call finishMatchAction when the dialog is confirmed', async () => {
    const { user, combobox, confirmButton } = renderComponent(MATCH_STATUS.SCHEDULED);

    await selectOption(user, combobox, /finalizado/i);
    await user.click(confirmButton());

    await waitFor(() => {
      expect(mockFinishAction).toHaveBeenCalledWith(props);
    });
  });

  test('Should show a success toast when the match is finished', async () => {
    const { toast } = await import('sonner');
    const { user, combobox, confirmButton } = renderComponent(MATCH_STATUS.SCHEDULED);

    await selectOption(user, combobox, /finalizado/i);
    await user.click(confirmButton());

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'El estado del partido finalizó correctamente',
      );
    });
  });

  test('Should show an error toast when finishing the match fails', async () => {
    mockFinishAction.mockResolvedValue({
      ok: false,
      message: 'No se pudo finalizar el partido',
    });
    const { toast } = await import('sonner');
    const { user, combobox, confirmButton } = renderComponent(MATCH_STATUS.SCHEDULED);

    await selectOption(user, combobox, /finalizado/i);
    await user.click(confirmButton());

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No se pudo finalizar el partido');
    });
  });

  test('Should not finish the match and keep the previous status when the dialog is canceled', async () => {
    const { user, combobox, cancelButton } = renderComponent(MATCH_STATUS.SCHEDULED);

    await selectOption(user, combobox, /finalizado/i);
    await user.click(cancelButton());

    expect(mockFinishAction).not.toHaveBeenCalled();
    expect(mockUpdateAction).not.toHaveBeenCalled();
    expect(combobox()).toHaveTextContent(/programado/i);
  });

  test('Should show a success toast on update', async () => {
    const { toast } = await import('sonner');
    const { user, combobox } = renderComponent(MATCH_STATUS.SCHEDULED);

    await selectOption(user, combobox, /en revisión/i);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'El estado del partido fue actualizado correctamente',
      );
    });
  });

  test('Should show an error toast when the action fails', async () => {
    mockUpdateAction.mockResolvedValue({
      ok: false,
      message: 'No se pudo actualizar el estado del partido',
    });
    const { toast } = await import('sonner');
    const { user, combobox } = renderComponent(MATCH_STATUS.IN_REVIEW);

    await selectOption(user, combobox, /cancelado/i);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No se pudo actualizar el estado del partido');
    });
  });
});
