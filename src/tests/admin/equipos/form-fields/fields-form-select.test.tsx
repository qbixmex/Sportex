import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldsFormSelect } from '@/app/admin/equipos/(components)/form-fields/field-select-field/fields-form-select';
import { FormValueDisplay, TeamFormWrapper } from '../mocks/form-wrapper.mock';

const fields = [
  { id: 'aa0e8400-e29b-41d4-a716-446655440035', name: 'Cancha 1' },
  { id: 'bb0e8400-e29b-41d4-a716-446655440036', name: 'Cancha 2' },
];

const renderComponent = (fieldsIds: string[] = []) => {
  render(
    <TeamFormWrapper defaultValues={{ fieldsIds }}>
      <FieldsFormSelect fields={fields} />
      <FormValueDisplay name="fieldsIds" />
    </TeamFormWrapper>,
  );

  const user = userEvent.setup();
  const input = screen.getByPlaceholderText(/buscar cancha/i);

  return { user, input };
};

describe('Test on <FieldsFormSelect />', () => {
  test('Should render the field', () => {
    renderComponent();

    expect(screen.getByText(/^canchas$/i)).toBeInTheDocument();
    expect(screen.getByText(/^\*$/i)).toHaveClass('text-orange-500');
    expect(screen.getByPlaceholderText(/buscar cancha/i)).toBeInTheDocument();
  });

  test('Should render chips for the selected fields', () => {
    const firstField = fields[0];
    renderComponent([firstField.id]);
    expect(screen.getByText(firstField.name)).toBeInTheDocument();
  });

  test('Should add a field when selecting an option', async () => {
    const { user, input } = renderComponent();
    const secondField = fields[1];

    await user.click(input);
    await user.click(await screen.findByRole('option', { name: secondField.name }));

    waitFor(() => {
      expect(screen.getByTestId('fieldsIds-value'))
        .toHaveTextContent(secondField.id);
    });
  });

  test('Should remove a field when clicking the chip remove button', async () => {
    const firstField = fields[0];
    const { user } = renderComponent([firstField.id]);

    const chip = screen.getByText(firstField.name).closest(
      '[data-slot="combobox-chip"]',
    ) as HTMLElement;
    const removeButton = chip.querySelector('button') as HTMLButtonElement;

    await user.click(removeButton);

    waitFor(() => {
      expect(screen.queryByText(firstField.name)).not.toBeInTheDocument();
    });
  });
});
