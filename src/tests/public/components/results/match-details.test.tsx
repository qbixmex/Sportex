import { MatchDetails } from '@/app/(public)/resultados/(components)/match-details';
import {
  type MatchType,
  fetchResultDetailsAction,
} from '@/app/(public)/resultados/(actions)/fetchResultDetailsAction';
import { render, screen } from '@testing-library/react';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { MATCH_MODE, MATCH_STATUS, SHOOTOUT_STATUS } from '@/shared/enums';
import { ROUTES } from '@/shared/constants/routes';
import { resolveFieldMaps } from '@/lib/maps';

vi.mock('@/app/(public)/resultados/(actions)/fetchResultDetailsAction');
vi.mock('@/lib/maps');

const mockRedirect = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

const TIME_ZONE = 'America/Mexico_City';

const MATCH_ID = '2c1b9b1e-6f2d-4e5a-9c3b-1a7d8e4f6c01';
const FETCH_ERROR_MESSAGE = 'El encuentro no existe';

const matchMock: MatchType = {
  id: MATCH_ID,
  localScore: 2,
  visitorScore: 1,
  matchDate: new Date('2026-05-16T17:00:00.000Z'),
  mode: MATCH_MODE.LEAGUE,
  week: 12,
  status: MATCH_STATUS.COMPLETED,
  field: {
    id: '78fb00e3-e4d2-49b9-838f-b6dc7c52bee1',
    name: 'Estadio Central',
    map: null,
    address: null,
    city: null,
    state: null,
    country: null,
  },
  referee: 'John Doe',
  tournament: {
    name: 'Liga Premier',
    permalink: 'liga-premier',
    country: 'México',
    season: '2026',
  },
  category: {
    name: 'Sub-17',
    permalink: 'sub-17',
  },
  local: {
    name: 'Club América',
    permalink: 'club-america',
    imageUrl: null,
    format: 'Fútbol 11',
    category: {
      name: 'Sub-17',
      permalink: 'sub-17',
    },
  },
  visitor: {
    name: 'Deportivo Lime',
    permalink: 'deportivo-lime',
    imageUrl: null,
    format: 'Fútbol 11',
    category: {
      name: 'Sub-17',
      permalink: 'sub-17',
    },
  },
  penaltyShootout: null,
};

const penaltyShootoutMock: NonNullable<MatchType['penaltyShootout']> = {
  id: '650108f4-d918-405e-b249-220249d6d340',
  localTeam: {
    id: '96f99393-cfd5-4703-b043-57764aa09e39',
    name: 'Club América',
    permalink: 'club-america',
  },
  visitorTeam: {
    id: '94f71e9c-c690-4ff4-830d-552d20f79c89',
    name: 'Deportivo Lime',
    permalink: 'deportivo-lime',
  },
  localGoals: 4,
  visitorGoals: 3,
  winnerTeamId: '96f99393-cfd5-4703-b043-57764aa09e39',
  status: SHOOTOUT_STATUS.COMPLETED,
  kicks: [
    {
      id: '07313cae-f6e4-4ab8-b99b-13c5a6744bdc',
      teamId: '96f99393-cfd5-4703-b043-57764aa09e39',
      playerId: null,
      shooterName: 'Player One',
      order: 1,
      isGoal: true,
    },
    {
      id: '252cd6e9-38aa-4ffe-8db7-4036aa4212ad',
      teamId: '94f71e9c-c690-4ff4-830d-552d20f79c89',
      playerId: null,
      shooterName: 'Player Two',
      order: 2,
      isGoal: false,
    },
  ],
};

const renderMatchDetails = async ({
  match = matchMock,
}: { match?: MatchType } = {}) => {
  vi.mocked(fetchResultDetailsAction).mockResolvedValue({
    ok: true,
    message: 'El encuentro fue obtenido correctamente',
    match,
  });

  const ServerComponent = await MatchDetails({ matchId: MATCH_ID });
  render(ServerComponent);
};

describe('Tests on <MatchDetails /> component', () => {
  beforeEach(() => {
    vi.mocked(resolveFieldMaps).mockResolvedValue([]);
  });

  test('Should pass the match id to the fetch action', async () => {
    await renderMatchDetails();

    expect(fetchResultDetailsAction).toHaveBeenCalledWith(MATCH_ID);
  });

  test('Should redirect to results page when fetch fails', async () => {
    vi.mocked(fetchResultDetailsAction).mockResolvedValue({
      ok: false,
      message: FETCH_ERROR_MESSAGE,
      match: null,
    });

    await expect(async () => {
      await MatchDetails({ matchId: MATCH_ID });
    }).rejects.toThrow();

    expect(mockRedirect).toHaveBeenCalledWith(
      ROUTES.PUBLIC_RESULTS +
      '?error=' +
      encodeURIComponent(FETCH_ERROR_MESSAGE),
    );
  });

  test('Should render local and visitor teams with their links', async () => {
    await renderMatchDetails();

    const local = screen.getByRole('link', { name: matchMock.local.name });
    const visitor = screen.getByRole('link', { name: matchMock.visitor.name });

    expect(local).toHaveAttribute(
      'href',
      `${ROUTES.PUBLIC_TEAMS}/${matchMock.local.permalink}` +
      `?tournament=${matchMock.tournament.permalink}` +
      `&category=${matchMock.local.category?.permalink}`,
    );
    expect(visitor).toHaveAttribute(
      'href',
      `${ROUTES.PUBLIC_TEAMS}/${matchMock.visitor.permalink}` +
      `?tournament=${matchMock.tournament.permalink}` +
      `&category=${matchMock.visitor.category?.permalink}`,
    );
  });

  test('Should render the match score', async () => {
    await renderMatchDetails();

    const localScore = screen.getByRole('status', { name: /anotaciones del equipo local/i });
    const visitorScore = screen.getByRole('status', { name: /anotaciones del equipo visitante/i });

    expect(localScore).toHaveTextContent(`${matchMock.localScore}`);
    expect(visitorScore).toHaveTextContent(`${matchMock.visitorScore}`);
  });

  test('Should render tournament link with correct href', async () => {
    await renderMatchDetails();

    const link = screen.getByRole('link', { name: matchMock.tournament.name });

    expect(link).toHaveAttribute(
      'href',
      ROUTES.PUBLIC_TOURNAMENT_SHOW(matchMock.tournament.permalink),
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  test('Should render the tournament name', async () => {
    await renderMatchDetails();

    const tournament = screen.getByLabelText(/torneo del encuentro/i);

    expect(tournament).toHaveTextContent(matchMock.tournament.name);
  });

  test('Should render the category name', async () => {
    await renderMatchDetails();

    const category = screen.getByRole('text', { name: /categoría del encuentro/i });

    expect(category).toHaveTextContent('Sub-17');
  });

  test('Should render category fallback when match has no category', async () => {
    await renderMatchDetails({ match: { ...matchMock, category: null } });

    const category = screen.getByRole('text', { name: /categoría del encuentro/i });

    expect(category).toHaveTextContent(/no disponible/i);
  });

  test('Should render both teams format', async () => {
    await renderMatchDetails();

    expect(
      screen.getByRole('text', { name: /formato del encuentro/i }),
    ).toHaveTextContent(/fútbol 11 vs fútbol 11/i);
  });

  test('Should render tournament country and season', async () => {
    await renderMatchDetails();

    expect(
      screen.getByRole('text', { name: /país del torneo/i }),
    ).toHaveTextContent('México');
    expect(
      screen.getByRole('text', { name: /temporada del torneo/i }),
    ).toHaveTextContent('2026');
  });

  test('Should render the league mode badge', async () => {
    await renderMatchDetails();

    expect(
      screen.getByLabelText(/modalidad del encuentro/i),
    ).toHaveTextContent('liga');
  });

  test('Should render the friendly mode badge', async () => {
    await renderMatchDetails({
      match: { ...matchMock, mode: MATCH_MODE.FRIENDLY },
    });

    expect(
      screen.getByLabelText(/modalidad del encuentro/i),
    ).toHaveTextContent('amistoso');
  });

  test('Should render the formatted match date', async () => {
    await renderMatchDetails();

    const day = formatInTimeZone(matchMock.matchDate!, TIME_ZONE, 'dd', { locale: es });
    const month = formatInTimeZone(matchMock.matchDate!, TIME_ZONE, 'LLLL', { locale: es });
    const year = formatInTimeZone(matchMock.matchDate!, TIME_ZONE, 'y', { locale: es });

    expect(
      screen.getByRole('text', { name: /fecha del encuentro/i }),
    ).toHaveTextContent(`${day} de ${month} del ${year}`);
  });

  test('Should render the formatted match time', async () => {
    await renderMatchDetails();

    const expectedTime = formatInTimeZone(
      matchMock.matchDate!,
      TIME_ZONE,
      'h:mm aaa',
      { locale: es },
    );

    expect(
      screen.getByRole('text', { name: /hora del encuentro/i }),
    ).toHaveTextContent(expectedTime);
  });

  test('Should render the match status', async () => {
    await renderMatchDetails();

    expect(
      screen.getByRole('text', { name: /estado del encuentro/i }),
    ).toHaveTextContent(/finalizado/i);
  });

  test('Should render match week, field and referee', async () => {
    await renderMatchDetails();

    expect(
      screen.getByRole('text', { name: /jornada del encuentro/i }),
    ).toHaveTextContent(`${matchMock.week}`);
    expect(
      screen.getByRole('text', { name: /sede del encuentro/i }),
    ).toHaveTextContent(matchMock.field!.name);
    expect(
      screen.getByRole('text', { name: /árbitro del encuentro/i }),
    ).toHaveTextContent(matchMock.referee!);
  });

  test('Should render fallbacks when week, field and referee are missing', async () => {
    await renderMatchDetails({
      match: { ...matchMock, week: null, field: null, referee: null },
    });

    expect(
      screen.getByRole('text', { name: /jornada del encuentro/i }),
    ).toHaveTextContent(/no especificada/i);
    expect(
      screen.getByRole('text', { name: /sede del encuentro/i }),
    ).toHaveTextContent(/no especificado/i);
    expect(
      screen.getByRole('text', { name: /árbitro del encuentro/i }),
    ).toHaveTextContent(/no especificado/i);
  });

  test('Should render the field maps when the match has a field', async () => {
    vi.mocked(resolveFieldMaps).mockResolvedValue([
      {
        id: matchMock.field!.id,
        name: matchMock.field!.name,
        link: 'https://maps.app.goo.gl/example',
        embedUrl: null,
      },
    ]);

    await renderMatchDetails();

    expect(resolveFieldMaps).toHaveBeenCalledWith([matchMock.field]);
    expect(screen.getByRole('heading', { name: /cancha/i })).toBeInTheDocument();
  });

  test('Should not render the field maps when the match has no field', async () => {
    await renderMatchDetails({ match: { ...matchMock, field: null } });

    expect(resolveFieldMaps).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('heading', { name: /cancha/i }),
    ).not.toBeInTheDocument();
  });

  test('Should render penalty shootout section when completed match ends in draw', async () => {
    await renderMatchDetails({
      match: {
        ...matchMock,
        localScore: 1,
        visitorScore: 1,
        penaltyShootout: penaltyShootoutMock,
      },
    });

    expect(
      screen.getByRole('heading', { name: /tanda de penales/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(penaltyShootoutMock.kicks[0].shooterName!)).toBeInTheDocument();
    expect(screen.getByText(penaltyShootoutMock.kicks[1].shooterName!)).toBeInTheDocument();
  });

  test('Should not render penalty shootout section when match has a winner', async () => {
    await renderMatchDetails();

    expect(
      screen.queryByRole('heading', { name: /tanda de penales/i }),
    ).not.toBeInTheDocument();
  });

  test('Should not render penalty shootout section when match is not completed', async () => {
    await renderMatchDetails({
      match: {
        ...matchMock,
        status: MATCH_STATUS.SCHEDULED,
        localScore: 1,
        visitorScore: 1,
        penaltyShootout: penaltyShootoutMock,
      },
    });

    expect(
      screen.queryByRole('heading', { name: /tanda de penales/i }),
    ).not.toBeInTheDocument();
  });
});
