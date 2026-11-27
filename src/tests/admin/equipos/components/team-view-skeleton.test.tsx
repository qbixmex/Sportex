import { render } from '@testing-library/react';
import { TeamViewSkeleton } from '@/app/admin/equipos/(components)/team-view-skeleton';

describe('Test on <TeamViewSkeleton /> component', () => {
  test('Should render the skeleton structure', () => {
    const { container } = render(<TeamViewSkeleton />);

    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass('animate-pulse');
    expect(root.children).toHaveLength(2);
  });

  test('Should render the image placeholder', () => {
    const { container } = render(<TeamViewSkeleton />);

    const root = container.firstElementChild as HTMLElement;
    const firstSection = root.children[0];
    const imagePlaceholder = firstSection.children[0] as HTMLElement;

    expect(imagePlaceholder).toHaveClass('h-[512px]');
  });
});
