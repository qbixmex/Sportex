import { render, screen } from '@testing-library/react';
import NotFoundPage from '@/app/admin/not-found';

describe('Tests on <NotFoundPage />', () => {
  test('Should render the not found heading', () => {
    render(<NotFoundPage />);

    const heading = screen.getByRole('heading', {
      level: 1,
      name: /página no encontrada/i,
    });

    expect(heading).toBeInTheDocument();
  });

  test('Should render the not found icon', () => {
    const { container } = render(<NotFoundPage />);

    const icon = container.querySelector('svg');

    expect(icon).toBeInTheDocument();
  });

  test('Should render inside the admin page wrapper', () => {
    const { container } = render(<NotFoundPage />);

    const page = container.firstElementChild;

    expect(page).toHaveClass('admin-page');
  });
});
