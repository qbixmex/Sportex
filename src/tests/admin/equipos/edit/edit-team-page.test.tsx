import { render, screen } from '@testing-library/react';
import EditTeamPage from '@/app/admin/equipos/editar/[id]/page';

vi.mock('@/app/admin/equipos/editar/[id]/edit-team-view', () => ({
  EditTeamView: () => <div data-testid="edit-team-view" />,
}));

describe('Test on <EditTeamPage />', () => {
  const renderComponent = async () => {
    const testId = '550e8400-e29b-41d4-a716-446655440001';
    const page = await EditTeamPage({
      params: Promise.resolve({ id: testId }),
    });
    render(page);

    const heading = () => screen.queryByText(/editar equipo/i);
    const editTeamView = () => screen.queryByTestId('edit-team-view');

    return {
      heading,
      editTeamView,
    };
  };

  test('Should render the title', async () => {
    const { heading } = await renderComponent();
    expect(heading()).toBeInTheDocument();
  });

  test('Should render <EditTeamView /> component', async () => {
    const { editTeamView } = await renderComponent();
    expect(editTeamView()).toBeInTheDocument();
  });
});
