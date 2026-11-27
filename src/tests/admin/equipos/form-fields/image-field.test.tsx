import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageField } from '@/app/admin/equipos/(components)/form-fields/image-field';
import {
  FormValueDisplay,
  SetValue,
  TeamFormWrapper,
} from '../mocks/form-wrapper.mock';

const renderComponent = (extra?: ReactNode) => {
  const { container } = render(
    <TeamFormWrapper>
      <ImageField />
      <FormValueDisplay name="image" />
      {extra}
    </TeamFormWrapper>,
  );

  const user = userEvent.setup();
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;

  return { user, input };
};

describe('Test on <ImageField />', () => {
  test('Should render the file input', () => {
    render(
      <TeamFormWrapper>
        <ImageField />
      </TeamFormWrapper>,
    );

    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByText(/imagen/i)).toBeInTheDocument();
    expect(screen.getByText(/opcional/i)).toHaveClass('text-gray-500');
  });

  test('Should not show an error when there is no image', () => {
    renderComponent();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('Should show an error when the value is not a File', async () => {
    renderComponent(<SetValue name="image" value="my-image.jpg" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/debe ser una imagen/i);
  });

  test('Should accept a valid image file', async () => {
    const file = new File(['image'], 'team.png', { type: 'image/png' });

    renderComponent(<SetValue name="image" value={file} />);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  test('Should show an error when the file is too large', async () => {
    const file = new File(
      [new ArrayBuffer(2 * 1024 * 1024 + 1)],
      'big.png',
      { type: 'image/png' },
    );

    renderComponent(<SetValue name="image" value={file} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/menor a 2mb/i);
  });

  test('Should show an error when the file type is not accepted', async () => {
    const file = new File(['abc'], 'dummy.txt', { type: 'text/plain' });

    renderComponent(<SetValue name="image" value={file} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/tipo de archivo/i);
  });

  test('Should update the form value when a file is selected', async () => {
    const { user, input } = renderComponent();
    const file = new File(['image'], 'team.png', { type: 'image/png' });

    await user.upload(input, file);

    await waitFor(() => {
      const selectedImage = screen.getByTestId('image-value');
      expect(selectedImage).toHaveTextContent('[object File]');
    });
  });
});
