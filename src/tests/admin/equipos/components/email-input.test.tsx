import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailInput } from '@/app/admin/equipos/(components)/email-input';

const renderComponent = ({
  value = [],
  onChange = vi.fn(),
  placeholder,
  className,
}: {
  value?: string[];
  onChange?: (emails: string[]) => void;
  placeholder?: string;
  className?: string;
} = {}) => {
  render(
    <EmailInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />,
  );

  const user = userEvent.setup();
  const input = screen.getByRole('textbox');

  return { user, input, onChange };
};

describe('Test on <EmailInput />', () => {
  test('Should render the input with the default placeholder', () => {
    const { input } = renderComponent();

    expect(input).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/escribe un email y presiona enter/i),
    ).toBeInTheDocument();
  });

  test('Should allow a custom placeholder and className', () => {
    const { container } = render(
      <EmailInput placeholder="Escribe aquí" className="custom-class" />,
    );

    expect(screen.getByPlaceholderText('Escribe aquí')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('custom-class');
  });

  test('Should add a valid email when pressing Enter', async () => {
    const { user, input, onChange } = renderComponent();

    await user.type(input, 'test@example.com{Enter}');

    expect(onChange).toHaveBeenCalledWith(['test@example.com']);
    expect(input).toHaveValue('');
  });

  test('Should trim the email before adding it', async () => {
    const { user, input, onChange } = renderComponent();

    await user.type(input, '  test@example.com  {Enter}');

    expect(onChange).toHaveBeenCalledWith(['test@example.com']);
  });

  test('Should ignore invalid emails', async () => {
    const { user, input, onChange } = renderComponent();

    await user.type(input, 'not-an-email{Enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  test('Should ignore duplicate emails', async () => {
    const { user, input, onChange } = renderComponent({
      value: ['test@example.com'],
    });

    await user.type(input, 'test@example.com{Enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  test('Should add the email on blur', async () => {
    const { user, input, onChange } = renderComponent();

    await user.type(input, 'test@example.com');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(['test@example.com']);
  });

  test('Should remove an email when clicking its remove button', async () => {
    const { user, onChange } = renderComponent({
      value: ['first@example.com', 'second@example.com'],
    });

    const removeButtons = screen.getAllByRole('button');
    await user.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith(['second@example.com']);
  });

  test('Should remove the last email when pressing Backspace with an empty input', async () => {
    const { user, input, onChange } = renderComponent({
      value: ['first@example.com', 'second@example.com'],
    });

    await user.type(input, '{Backspace}');

    expect(onChange).toHaveBeenCalledWith(['first@example.com']);
  });
});
