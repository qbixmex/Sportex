import { render, screen } from '@testing-library/react';
import CreateTeamPage from '@/app/admin/equipos/crear/page';

vi.mock('@/app/admin/equipos/crear/create-team-form', () => ({
  CreateTeamForm: () => <div data-testid="create-team-form" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/category-select-field', () => ({
  CategorySelectField: () => <div data-testid="category-select-field" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/tournament-select-field', () => ({
  TournamentSelectField: () => <div data-testid="tournament-select-field" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/coach-select-field', () => ({
  CoachSelectField: () => <div data-testid="coach-select-field" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/field-select-field', () => ({
  FieldSelectField: () => <div data-testid="field-select-field" />,
}));

describe('Test on <CreateTeamPage />', () => {
  test('Should render the title', () => {
    render(<CreateTeamPage />);
    const heading = screen.queryByText(/crear equipo/i);
    expect(heading).toBeInTheDocument();
  });

  test('Should render <CreateTeamForm /> component', () => {
    render(<CreateTeamPage />);
    const form = screen.queryByTestId('create-team-form');
    expect(form).toBeInTheDocument();
  });
});
