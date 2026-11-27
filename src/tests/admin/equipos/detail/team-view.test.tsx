import { render, screen } from '@testing-library/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TeamPageView } from '@/app/admin/equipos/[id]/team-view';
import { fetchTeamAction } from '@/app/admin/equipos/(actions)';
import { resolveFieldMaps } from '@/lib/maps';
import { ROUTES } from '@/shared/constants/routes';
import {
  teamDetailMock,
  teamDetailWithoutRelationsMock,
} from '../mocks/team-detail.mock';

const mockRedirect = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error('NEXT_REDIRECT');
  },
}));

vi.mock('@/app/admin/equipos/(actions)', () => ({
  fetchTeamAction: vi.fn(),
}));

vi.mock('@/lib/maps', () => ({
  resolveFieldMaps: vi.fn(),
}));

vi.mock('@/app/admin/equipos/(components)/delete-team-image', () => ({
  DeleteTeamImage: () => <div data-testid="delete-team-image" />,
}));

vi.mock('@/app/admin/equipos/(components)/generate-generic-players', () => ({
  GenerateGenericPlayers: () => <div data-testid="generate-generic-players" />,
}));

vi.mock('@/shared/components/delete-players', () => ({
  DeletePlayers: () => <div data-testid="delete-players" />,
}));

vi.mock('@/shared/components/fields-map', () => ({
  FieldsMap: ({ maps }: { maps: unknown[] }) => (
    <div data-testid="fields-map" data-maps={maps.length} />
  ),
}));

vi.mock('@/app/admin/equipos/(components)/edit-team', () => ({
  EditTeam: ({ teamId }: { teamId: string }) => (
    <div data-testid="edit-team" data-team-id={teamId} />
  ),
}));

const renderComponent = async (
  team = teamDetailMock,
  ok = true,
  message = 'Equipo obtenido correctamente',
) => {
  vi.mocked(fetchTeamAction).mockResolvedValue({
    ok,
    message,
    team: ok ? team : null,
  } as never);

  const ServerComponent = await TeamPageView({
    params: Promise.resolve({ id: teamDetailMock.id }),
  });
  render(ServerComponent);
};

describe('Tests on <TeamPageView />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveFieldMaps).mockResolvedValue([
      {
        id: teamDetailMock.fields[0].id,
        name: teamDetailMock.fields[0].name,
        link: teamDetailMock.fields[0].map!,
        embedUrl: null,
      },
    ]);
  });

  test('Should redirect when the team cannot be fetched', async () => {
    const errorMessage = 'Equipo no encontrado';
    vi.mocked(fetchTeamAction).mockResolvedValue({
      ok: false,
      message: errorMessage,
      team: null,
    } as never);

    await expect(
      TeamPageView({
        params: Promise.resolve({ id: teamDetailMock.id }),
      }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      ROUTES.ADMIN_TEAMS +
      '?error=' +
      encodeURIComponent(errorMessage),
    );
  });

  test('Should render the heading', async () => {
    await renderComponent();

    expect(screen.getByText(/información del equipo/i)).toBeInTheDocument();
  });

  test('Should render the team information', async () => {
    await renderComponent();

    expect(screen.getByText(teamDetailMock.name)).toBeInTheDocument();
    expect(screen.getByText(teamDetailMock.category!.name)).toBeInTheDocument();
    expect(
      screen.getByText(`${teamDetailMock.format} vs ${teamDetailMock.format}`),
    ).toBeInTheDocument();
    expect(screen.getByText(/varonil/i)).toBeInTheDocument();
    expect(screen.getByText(teamDetailMock.country!)).toBeInTheDocument();
    expect(screen.getByText(teamDetailMock.state!)).toBeInTheDocument();
    expect(screen.getByText(teamDetailMock.city!)).toBeInTheDocument();
  });

  test('Should render the tournament link', async () => {
    await renderComponent();

    const tournamentLink = screen.getByRole('link', {
      name: teamDetailMock.tournament!.name,
    });

    expect(tournamentLink).toHaveAttribute(
      'href',
      ROUTES.ADMIN_TOURNAMENTS_SHOW(teamDetailMock.tournament!.id),
    );
  });

  test('Should render coach link', async () => {
    await renderComponent();

    const coachLink = screen.getByRole('link', {
      name: teamDetailMock.coach!.name,
    });

    expect(coachLink).toHaveAttribute(
      'href',
      ROUTES.ADMIN_COACHES_SHOW(teamDetailMock.coach!.id),
    );
  });

  test('Should render the active status', async () => {
    await renderComponent();

    expect(screen.getByText(/activo/i)).toBeInTheDocument();
  });

  test('Should render the inactive status', async () => {
    await renderComponent({
      ...teamDetailMock,
      active: false,
    });

    expect(screen.getByText(/no activo/i)).toBeInTheDocument();
  });

  test('Should render a fallback badge whe tournament is not assigned', async () => {
    await renderComponent(teamDetailWithoutRelationsMock);

    const tournamentFallback = screen.getByTestId('empty-tournament');

    expect(tournamentFallback).toHaveTextContent(/no asignado/i);
  });

  test('Should render a fallback badge when coach is not assigned', async () => {
    await renderComponent(teamDetailWithoutRelationsMock);

    const coachFallback = screen.getByTestId('empty-coach');

    expect(coachFallback).toHaveTextContent(/no asignado/i);
  });

  test('Should render the image placeholder when there is no image', async () => {
    await renderComponent();

    const imageFallback = screen.queryByTestId('empty-team-image');
    expect(imageFallback).toBeInTheDocument();
  });

  test('Should render the image and delete button when there is one', async () => {
    await renderComponent({
      ...teamDetailMock,
      imageUrl: '/images/aguilas.jpg',
    });

    const image = screen.queryByRole('img', { name: /imagen de perfil de Águilas/i });

    expect(image).toHaveAttribute('alt', `imagen de perfil de ${teamDetailMock.name}`);
    expect(screen.getByTestId('delete-team-image')).toBeInTheDocument();
  });

  test('Should render the field badges with links', async () => {
    await renderComponent();

    const field = teamDetailMock.fields[0];
    const fieldLink = screen.getByRole('link', { name: field.name });

    expect(fieldLink).toHaveAttribute('href', ROUTES.ADMIN_FIELDS_SHOW(field.id));
    expect(fieldLink).toHaveAttribute('target', '_blank');
  });

  test('Should render a fallback message when there are no fields assigned', async () => {
    await renderComponent({
      ...teamDetailMock,
      fields: [],
    });

    const fieldFallback = screen.getByTestId('empty-field');

    expect(fieldFallback).toHaveTextContent(/no asignada/i);
  });

  test('Should render the singular heading for one field', async () => {
    await renderComponent();

    const fieldHeading = screen.queryByText(/^sede$/i);

    expect(fieldHeading).toBeInTheDocument();
  });

  test('Should render the plural heading for more than one field', async () => {
    await renderComponent({
      ...teamDetailMock,
      fields: [
        ...teamDetailMock.fields,
        {
          id: 'bb0e8400-e29b-41d4-a716-446655440036',
          name: 'Cancha 2',
          map: null,
          address: null,
          city: null,
          state: null,
          country: null,
        },
      ],
    });

    const fieldHeading = screen.queryByText(/^sedes$/i);

    expect(fieldHeading).toBeInTheDocument();
  });

  test('Should render the generic players button when there are no players', async () => {
    await renderComponent({
      ...teamDetailMock,
      players: [],
    });

    const emptyMessage = screen.queryByText(/aún no hay jugadores registrados/i);
    const generatePlayers = screen.getByTestId('generate-generic-players');

    expect(emptyMessage).toBeInTheDocument();
    expect(generatePlayers).toBeInTheDocument();
  });

  test('Should render the player badges with links', async () => {
    await renderComponent();

    const player = teamDetailMock.players![0];
    const playerLink = screen.getByRole('link', { name: player.name });

    expect(playerLink).toHaveAttribute(
      'href',
      ROUTES.ADMIN_PLAYER_SHOW(player.id),
    );
  });

  test('Should render delete players button', async () => {
    await renderComponent();
    const deletePlayers = screen.getByTestId('delete-players');
    expect(deletePlayers).toBeInTheDocument();
  });

  test('Should render team permalink', async () => {
    await renderComponent();
    expect(screen.getByText(teamDetailMock.permalink)).toBeInTheDocument();
  });

  test('Should render team address', async () => {
    await renderComponent();
    expect(screen.getByText(teamDetailMock.address!)).toBeInTheDocument();
  });

  test('Should render the address fallback', async () => {
    await renderComponent({
      ...teamDetailMock,
      address: null,
    });

    const addressFallback = screen.getByTestId('empty-address');

    expect(addressFallback).toHaveTextContent(/no especificada/i);
  });

  test('Should render team dates data', async () => {
    await renderComponent();

    const createdDate = format(
      new Date(teamDetailMock.createdAt as Date),
      "d 'de' MMMM 'del' yyyy",
      { locale: es },
    );
    const updatedDate = format(
      new Date(teamDetailMock.updatedAt as Date),
      "d 'de' MMMM 'del' yyyy",
      { locale: es },
    );

    expect(screen.getByText(createdDate)).toBeInTheDocument();
    expect(screen.getByText(updatedDate)).toBeInTheDocument();
  });

  test('Should call resolveFieldMaps with the team fields and location', async () => {
    await renderComponent();

    expect(resolveFieldMaps).toHaveBeenCalledWith(teamDetailMock.fields, {
      address: teamDetailMock.address,
      city: teamDetailMock.city,
      state: teamDetailMock.state,
      country: teamDetailMock.country,
    });
  });

  test('Should render the edit button', async () => {
    await renderComponent();

    const editButton = screen.getByTestId('edit-team');

    expect(editButton).toHaveAttribute('data-team-id', teamDetailMock.id);
  });
});
