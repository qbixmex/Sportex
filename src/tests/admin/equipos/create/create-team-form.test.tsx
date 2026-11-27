import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CreateTeamForm } from '@/app/admin/equipos/crear/create-team-form';
import { useCreateTeam } from '@/app/admin/equipos/crear/use-create-team';

vi.mock('@/app/admin/equipos/crear/use-create-team');

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

const slots = {
  tournamentSlot: <div data-testid="tournament-slot" />,
  categorySlot: <div data-testid="category-slot" />,
  coachesSlot: <div data-testid="coaches-slot" />,
  fieldsSlot: <div data-testid="fields-slot" />,
};

describe('Test on <CreateTeamForm />', () => {
  beforeEach(() => {
    vi.mocked(useCreateTeam).mockReturnValue(defaultMockReturn as never);
  });

  const renderComponent = () => {
    render(<CreateTeamForm {...slots} />);

    const user = userEvent.setup();
    const formFields = screen.getByTestId('form-fields');
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    const submitButton = screen.getByRole('button', { name: /^crear$/i });

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
    vi.mocked(useCreateTeam).mockReturnValue({
      ...defaultMockReturn,
      handleNavigateBack: mockHandleNavigateBack,
    } as never);

    const { user, cancelButton } = renderComponent();
    await user.click(cancelButton);

    expect(mockHandleNavigateBack).toHaveBeenCalled();
  });

  test('Should call onSubmit when submit is clicked', async () => {
    const mockOnSubmit = vi.fn();
    vi.mocked(useCreateTeam).mockReturnValue({
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
    const mockOnSubmit = vi.fn();

    vi.mocked(useCreateTeam).mockReturnValue({
      ...defaultMockReturn,
      form: {
        handleSubmit: vi.fn((onSubmit: () => void) => (e: { preventDefault: () => void }) => {
          e.preventDefault();
          onSubmit();
        }),
        formState: { isSubmitting: true },
      },
      onSubmit: mockOnSubmit,
    } as never);

    render(<CreateTeamForm {...slots} />);

    await waitFor(() => {
      const waitText = screen.getByText(/espere/i);
      const submitButton = screen.getByRole('button', { name: /espere/i });

      expect(waitText).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(screen.queryByRole('button', { name: /^crear$/i })).not.toBeInTheDocument();
    });
  });
});
