import { render } from '@testing-library/react';
import { TournamentsSelectorSkeleton } from '@/app/admin/equipos/(components)/TournamentsSelectorSkeleton';

describe('Test on <TournamentsSelectorSkeleton /> component', () => {
  test('Should render the skeleton', () => {
    const { container } = render(<TournamentsSelectorSkeleton />);

    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass('animate-pulse');
    expect(root.children).toHaveLength(2);
  });

  test('Should render the placeholder boxes with the expected size', () => {
    const { container } = render(<TournamentsSelectorSkeleton />);

    const boxes = Array.from(container.firstElementChild!.children);

    boxes.forEach((box) => {
      expect(box).toHaveClass('w-full', 'lg:w-1/2', 'h-10', 'rounded-lg');
    });
  });
});
