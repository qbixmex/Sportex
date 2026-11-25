import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyMap } from '@/shared/components/fields-map/copy-map';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const mapUrl = 'https://maps.app.goo.gl/link-a';

const writeText = vi.fn<(text: string) => Promise<void>>();

const setClipboard = (value: unknown) => {
  Object.defineProperty(navigator, 'clipboard', {
    value,
    configurable: true,
  });
};

describe('Tests on <CopyMap />', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    writeText.mockResolvedValue(undefined);
  });

  afterEach(() => {
    setClipboard(undefined);
    vi.useRealTimers();
  });

  const renderComponent = () => {
    render(<CopyMap mapUrl={mapUrl} />);

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // userEvent.setup() replaces navigator.clipboard with its own stub, so the
    // mock has to be installed after the session is created.
    setClipboard({ writeText });

    const button = screen.getByRole('button', { name: /copiar mapa/i });

    return { user, button };
  };

  test('Should render the copy button enabled', () => {
    const { button } = renderComponent();

    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  test('Should copy the received map url to the clipboard', async () => {
    const { toast } = await import('sonner');
    const { user, button } = renderComponent();

    await user.click(button);
    await act(async () => {});

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(mapUrl);
    expect(toast.success).toHaveBeenCalledWith('Mapa copiado correctamente', {
      duration: 3000,
    });
  });

  test('Should NOT invoke handleCopy while isCopying is true', async () => {
    const { user, button } = renderComponent();

    await user.click(button);

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();

    await user.click(button);

    expect(writeText).toHaveBeenCalledTimes(1);
  });

  test('Should be clickable again after 3 seconds', async () => {
    const { user, button } = renderComponent();

    await user.click(button);

    expect(button).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(button).toBeEnabled();
  });
});
