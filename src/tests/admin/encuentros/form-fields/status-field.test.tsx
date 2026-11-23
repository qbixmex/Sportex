import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { StatusField } from '@/app/admin/encuentros/(components)/form-fields/status-field';
import { MATCH_STATUS, type MATCH_STATUS_TYPE } from '@/shared/enums';
import { getStatusTranslation } from '@/lib/utils';

type WrapperProps = Readonly<{
  children: ReactNode;
  defaultStatus?: MATCH_STATUS_TYPE;
}>;

function TestWrapper({ children, defaultStatus }: WrapperProps) {
  const form = useForm({ defaultValues: { status: defaultStatus } });

  return (
    <FormProvider {...form}>
      {children}
    </FormProvider>
  );
}

function FormValueDisplay() {
  const status = useWatch({ name: 'status' });
  return <span data-testid="status-value">{status}</span>;
}

type RenderOptions = Readonly<{
  isEditing?: boolean;
  defaultStatus?: MATCH_STATUS_TYPE;
  extra?: ReactNode;
}>;

describe('Test on <StatusField />', () => {
  const renderComponent = ({
    isEditing = false,
    defaultStatus,
    extra,
  }: RenderOptions = {}) => {
    render(
      <TestWrapper defaultStatus={defaultStatus}>
        <StatusField isEditing={isEditing} />
        {extra}
      </TestWrapper>,
    );

    const user = userEvent.setup();
    const combobox = () => screen.getByRole('combobox');
    const confirmButton = () => screen.getByRole('button', { name: /proceder/i });
    const cancelButton = () => screen.getByRole('button', { name: /^cancelar$/i });

    return { user, combobox, confirmButton, cancelButton };
  };

  const selectOption = async (
    user: ReturnType<typeof userEvent.setup>,
    combobox: () => HTMLElement,
    name: string | RegExp,
  ) => {
    await user.click(combobox());
    const option = await screen.findByRole('option', { name });
    await user.click(option);
  };

  test('Should render the label and the select', () => {
    const { combobox } = renderComponent();

    const label = screen.getByText('Estado');
    const placeholder = screen.getByText(/seleccione estado/i);

    expect(label).toBeInTheDocument();
    expect(combobox()).toBeInTheDocument();
    expect(placeholder).toBeInTheDocument();
  });

  test('Should update the form value when selecting in review option', async () => {
    const { user, combobox } = renderComponent({ extra: <FormValueDisplay /> });

    await selectOption(user, combobox, getStatusTranslation(MATCH_STATUS.IN_REVIEW));

    await waitFor(() => {
      const statusValue = screen.getByTestId('status-value');
      expect(statusValue).toHaveTextContent(MATCH_STATUS.IN_REVIEW);
    });
  });

  test('Should update the form value when selecting scheduled option', async () => {
    const { user, combobox } = renderComponent({ extra: <FormValueDisplay /> });

    await selectOption(user, combobox, getStatusTranslation(MATCH_STATUS.SCHEDULED));

    await waitFor(() => {
      const statusValue = screen.getByTestId('status-value');
      expect(statusValue).toHaveTextContent(MATCH_STATUS.SCHEDULED);
    });
  });

  test('Should update the form value when selecting in progress option', async () => {
    const { user, combobox } = renderComponent({ extra: <FormValueDisplay /> });

    await selectOption(user, combobox, getStatusTranslation(MATCH_STATUS.IN_PROGRESS));

    await waitFor(() => {
      const statusValue = screen.getByTestId('status-value');
      expect(statusValue).toHaveTextContent(MATCH_STATUS.IN_PROGRESS);
    });
  });

  test('Should update the form value when selecting post posed option', async () => {
    const { user, combobox } = renderComponent({ extra: <FormValueDisplay /> });

    await selectOption(user, combobox, getStatusTranslation(MATCH_STATUS.POST_POSED));

    await waitFor(() => {
      const statusValue = screen.getByTestId('status-value');
      expect(statusValue).toHaveTextContent(MATCH_STATUS.POST_POSED);
    });
  });

  test('Should update the form value when selecting canceled option', async () => {
    const { user, combobox } = renderComponent({ extra: <FormValueDisplay /> });

    await selectOption(user, combobox, getStatusTranslation(MATCH_STATUS.CANCELED));

    await waitFor(() => {
      const statusValue = screen.getByTestId('status-value');
      expect(statusValue).toHaveTextContent(MATCH_STATUS.CANCELED);
    });
  });

  test('Should not render the finalizado option when creating a match', async () => {
    const { user, combobox } = renderComponent({ isEditing: false });

    await user.click(combobox());

    expect(screen.queryByRole('option', { name: /finalizado/i })).not.toBeInTheDocument();
  });

  test('Should render the finalizado option when editing a match', async () => {
    const { user, combobox } = renderComponent({ isEditing: true });

    await user.click(combobox());

    expect(await screen.findByRole('option', { name: /finalizado/i })).toBeInTheDocument();
  });

  test('Should open the warning dialog and keep the previous status when finalizado is selected', async () => {
    const { user, combobox } = renderComponent({
      isEditing: true,
      defaultStatus: MATCH_STATUS.SCHEDULED,
      extra: <FormValueDisplay />,
    });

    await selectOption(user, combobox, /finalizado/i);

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/impactará la tabla de posiciones/i)).toBeInTheDocument();
    expect(screen.getByTestId('status-value')).toHaveTextContent(MATCH_STATUS.SCHEDULED);
  });

  test('Should set the form value to completed when the dialog is confirmed', async () => {
    const { user, combobox, confirmButton } = renderComponent({
      isEditing: true,
      defaultStatus: MATCH_STATUS.SCHEDULED,
      extra: <FormValueDisplay />,
    });

    await selectOption(user, combobox, /finalizado/i);
    await user.click(confirmButton());

    await waitFor(() => {
      expect(screen.getByTestId('status-value')).toHaveTextContent(MATCH_STATUS.COMPLETED);
    });
  });

  test('Should keep the previous status when the dialog is canceled', async () => {
    const { user, combobox, cancelButton } = renderComponent({
      isEditing: true,
      defaultStatus: MATCH_STATUS.IN_PROGRESS,
      extra: <FormValueDisplay />,
    });

    await selectOption(user, combobox, /finalizado/i);
    await user.click(cancelButton());

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('status-value')).toHaveTextContent(MATCH_STATUS.IN_PROGRESS);
  });
});
