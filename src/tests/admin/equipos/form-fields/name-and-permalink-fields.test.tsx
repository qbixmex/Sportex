import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NameAndPermalinkFields } from '@/app/admin/equipos/(components)/form-fields/name-and-permalink-fields';
import { FormValueDisplay, TeamFormWrapper } from '../mocks/form-wrapper.mock';

const renderComponent = () => {
  render(
    <TeamFormWrapper defaultValues={{ name: '', permalink: '' }}>
      <NameAndPermalinkFields />
      <FormValueDisplay name="name" />
      <FormValueDisplay name="permalink" />
    </TeamFormWrapper>,
  );

  const user = userEvent.setup();
  const [nameInput, permalinkInput] = screen.getAllByRole('textbox');

  return { user, nameInput, permalinkInput };
};

describe('Test on <NameAndPermalinkFields />', () => {
  test('Should render both fields', () => {
    const { nameInput, permalinkInput } = renderComponent();

    expect(nameInput).toBeInTheDocument();
    expect(permalinkInput).toBeInTheDocument();
  });

  test('Should generate the permalink from the name', async () => {
    const { user, nameInput } = renderComponent();

    await user.type(nameInput, 'Lobos');

    await waitFor(() => {
      expect(screen.getByTestId('name-value')).toHaveTextContent('Lobos');
      expect(screen.getByTestId('permalink-value'))
        .toHaveTextContent('lobos');
    });
  });

  test('Should stop generating the permalink after it is edited manually', async () => {
    const { user, nameInput, permalinkInput } = renderComponent();

    await user.type(nameInput, 'Lobos');
    await waitFor(() => {
      expect(screen.getByTestId('permalink-value'))
        .toHaveTextContent('lobos');
    });

    await user.clear(permalinkInput);
    await user.type(permalinkInput, 'sharks');

    await user.clear(nameInput);
    await user.type(nameInput, 'Warriors');

    await waitFor(() => {
      expect(screen.getByTestId('name-value'))
        .toHaveTextContent('Warriors');

      expect(screen.getByTestId('permalink-value'))
        .toHaveTextContent('sharks');
    });
  });
});
