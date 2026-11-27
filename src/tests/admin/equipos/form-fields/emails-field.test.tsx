import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailsField } from '@/app/admin/equipos/(components)/form-fields/emails-field';
import { TeamFormWrapper } from '../mocks/form-wrapper.mock';

const renderComponent = () => {
  render(
    <TeamFormWrapper defaultValues={{ emails: [] }}>
      <EmailsField />
    </TeamFormWrapper>,
  );

  const user = userEvent.setup();
  const input = screen.getByRole('textbox');

  return { user, input };
};

describe('Test on <EmailsField />', () => {
  test('Should render the input', () => {
    const { input } = renderComponent();

    const placeholderText = screen.getByPlaceholderText(/escriba un correo y presiona enter/i);

    expect(input).toBeInTheDocument();
    expect(placeholderText).toBeInTheDocument();
  });

  test('Should add an email when pressing Enter', async () => {
    const { user, input } = renderComponent();

    await user.type(input, 'test@example.com{Enter}');

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/agregar otro/i)).toBeInTheDocument();
  });

  test('Should trim the email before adding it', async () => {
    const { user, input } = renderComponent();

    await user.type(input, '  test@example.com  {Enter}');

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.queryByText('  test@example.com  ')).not.toBeInTheDocument();
  });

  test('Should ignore an empty email', async () => {
    const { user, input } = renderComponent();
    const emptyValue = ' ';

    await user.type(input, emptyValue + '{Enter}');

    const button = screen.queryByRole('button', { name: /eliminar/i });

    expect(button).not.toBeInTheDocument();
  });

  test('Should ignore duplicate emails regardless of case', async () => {
    const { user, input } = renderComponent();

    await user.type(input, 'test@example.com{Enter}');
    await user.type(input, 'TEST@example.com{Enter}');

    expect(screen.getAllByText(/test@example.com/i)).toHaveLength(1);
  });

  test('Should remove an email when clicking its button', async () => {
    const { user, input } = renderComponent();

    await user.type(input, 'test@example.com{Enter}');
    await user.click(
      screen.getByRole('button', { name: /eliminar test@example\.com/i }),
    );

    await waitFor(() => {
      expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
    });
  });

  test('Should remove the last email when pressing Backspace with an empty input', async () => {
    const { user, input } = renderComponent();

    await user.type(input, 'first@example.com{Enter}');
    await user.type(input, 'second@example.com{Enter}');

    await user.type(input, '{Backspace}');

    await waitFor(() => {
      expect(screen.queryByText('second@example.com')).not.toBeInTheDocument();
      expect(screen.getByText('first@example.com')).toBeInTheDocument();
    });
  });
});
