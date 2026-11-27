import { render } from '@testing-library/react';
import { FieldSkeleton } from '@/app/admin/equipos/(components)/field-skeleton';

describe('Test on <FieldSkeleton /> component', () => {
  test('Should render the skeleton', () => {
    const { container } = render(<FieldSkeleton />);

    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass('animate-pulse', 'space-y-2', 'mb-5');
    expect(root.children).toHaveLength(2);
  });

  test('Should render the expected placeholder sizes', () => {
    const { container } = render(<FieldSkeleton />);

    const [label, input] = Array.from(
      container.firstElementChild!.children,
    ) as HTMLElement[];

    expect(label).toHaveClass('w-30', 'h-5');
    expect(input).toHaveClass('w-full', 'h-8');
  });
});
