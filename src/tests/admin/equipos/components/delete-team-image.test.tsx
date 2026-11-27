import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteTeamImage } from '@/app/admin/equipos/(components)/delete-team-image';
import { deleteTeamImageAction } from '@/app/admin/equipos/(actions)/deleteTeamImageAction';

vi.mock('@/app/admin/equipos/(actions)/deleteTeamImageAction', () => ({
  deleteTeamImageAction: vi.fn(),
}));

vi.mock('@/shared/components/delete-image', () => ({
  DeleteImage: ({
    onDeleteImage,
    className,
  }: {
    onDeleteImage: () => void;
    className?: string;
  }) => (
    <button
      type="button"
      data-testid="delete-image"
      className={className}
      onClick={onDeleteImage}
    />
  ),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const teamId = '550e8400-e29b-41d4-a716-446655440001';

describe('Test on <DeleteTeamImage /> component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(deleteTeamImageAction).mockResolvedValue({
      ok: true,
      message: 'La imagen ha sido eliminada correctamente',
    });
  });

  test('Should pass the className to <DeleteImage />', () => {
    render(
      <DeleteTeamImage
        teamId={teamId}
        className="custom-class"
      />,
    );

    expect(screen.getByTestId('delete-image')).toHaveClass('custom-class');
  });

  test('Should delete the image and show a success toast', async () => {
    const { toast } = await import('sonner');
    const user = userEvent.setup();
    render(<DeleteTeamImage teamId={teamId} />);

    await user.click(screen.getByTestId('delete-image'));

    expect(deleteTeamImageAction).toHaveBeenCalledWith(teamId);
    expect(toast.success).toHaveBeenCalledWith(
      'La imagen ha sido eliminada correctamente',
    );
  });

  test('Should show an error toast when deletion fails', async () => {
    vi.mocked(deleteTeamImageAction).mockResolvedValue({
      ok: false,
      message: 'No se puede eliminar la imagen',
    });
    const { toast } = await import('sonner');
    const user = userEvent.setup();
    render(<DeleteTeamImage teamId={teamId} />);

    await user.click(screen.getByTestId('delete-image'));

    expect(toast.error).toHaveBeenCalledWith('No se puede eliminar la imagen');
  });
});
