import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActiveSwitch } from '@/app/admin/equipos/(components)/form-fields/active-switch';
import { FormValueDisplay, TeamFormWrapper } from '../mocks/form-wrapper.mock';

const renderComponent = () => {
  const { container } = render(
    <TeamFormWrapper defaultValues={{ active: false }}>
      <ActiveSwitch />
      <FormValueDisplay name="active" />
    </TeamFormWrapper>,
  );

  const user = userEvent.setup();
  const switchField = container.querySelector('#active');

  return { user, switchField };
};

describe('Test on <ActiveSwitch />', () => {
  test('Should render the switch', () => {
    const { switchField } = renderComponent();

    expect(switchField).toBeInTheDocument();
    expect(switchField).toHaveAttribute('aria-checked', 'false');
  });

  test('Should toggle on when clicked', async () => {
    const { user, switchField } = renderComponent();

    await user.click(switchField as HTMLElement);

    expect(switchField).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('active-value')).toHaveTextContent('true');
  });

  test('Should toggle off when clicked twice', async () => {
    const { user, switchField } = renderComponent();

    await user.click(switchField as HTMLElement);
    await user.click(switchField as HTMLElement);

    expect(switchField).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByTestId('active-value')).toHaveTextContent('false');
  });
});
