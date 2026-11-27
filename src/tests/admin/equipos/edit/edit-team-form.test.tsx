import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { EditTeamForm } from '@/app/admin/equipos/editar/[id]/edit-team-form';
import { useEditTeam } from '@/app/admin/equipos/editar/[id]/use-edit-team';
import { teamMock } from '../mocks/team.mock';

vi.mock('@/app/admin/equipos/editar/[id]/use-edit-team');

vi.mock('@/app/admin/equipos/(components)/form-fields', () => ({
  FormFields: () => <div data-testid="form-fields" />,
}));

const defaultMockReturn = {
  form: {
    handleSubmit: vi.fn((onSubmit: () => void) => onSubmit),
    formState: { isSubmitting: false },
  },
  onSubmit: vi.fn(),
  handleNavigateBack: vi.fn(),
};

const defaultProps = {
  team: teamMock,
  tournamentSlot: <div data-testid="tournament-slot" />,
  categorySlot: <div data-testid="category-slot" />,
  coachesSlot: <div data-testid="coaches-slot" />,
  fieldsSlot: <div data-testid="fields-slot" />,
};

describe('Test on <EditTeamForm />', () => {
  beforeEach(() => {
    vi.mocked(useEditTeam).mockReturnValue(defaultMockReturn as never);
  });

  const renderComponent = () => {
    render(<EditTeamForm {...defaultProps} />);

    const user = userEvent.setup();
    const formFields = screen.getByTestId('form-fields');
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    const submitButton = screen.getByRole('button', { name: /^guardar$/i });

    return { user, formFields, cancelButton, submitButton };
  };

  test('Should render correctly', () => {
    const { formFields, cancelButton, submitButton } = renderComponent();

    expect(formFields).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  test('Should call handleNavigateBack when cancel is clicked', async () => {
    const mockHandleNavigateBack = vi.fn();
    vi.mocked(useEditTeam).mockReturnValue({
      ...defaultMockReturn,
      handleNavigateBack: mockHandleNavigateBack,
    } as never);

    const { user, cancelButton } = renderComponent();
    await user.click(cancelButton);

    expect(mockHandleNavigateBack).toHaveBeenCalled();
  });

  test('Should call onSubmit when submit is clicked', async () => {
    const mockOnSubmit = vi.fn();
    vi.mocked(useEditTeam).mockReturnValue({
      ...defaultMockReturn,
      form: {
        handleSubmit: vi.fn((onSubmit: () => void) => (e: { preventDefault: () => void }) => {
          e.preventDefault();
          onSubmit();
        }),
        formState: { isSubmitting: false },
      },
      onSubmit: mockOnSubmit,
    } as never);

    const { user, submitButton } = renderComponent();
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  test('Should show loading state when form is submitting', async () => {
    vi.mocked(useEditTeam).mockReturnValue({
      ...defaultMockReturn,
      form: {
        handleSubmit: vi.fn((onSubmit: () => void) => (e: { preventDefault: () => void }) => {
          e.preventDefault();
          onSubmit();
        }),
        formState: { isSubmitting: true },
      },
    } as never);

    render(<EditTeamForm {...defaultProps} />);

    await waitFor(() => {
      const waitText = screen.getByText(/espere/i);
      const submitButton = screen.getByRole('button', { name: /espere/i });

      expect(waitText).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(screen.queryByRole('button', { name: /^guardar$/i })).not.toBeInTheDocument();
    });
  });
});
