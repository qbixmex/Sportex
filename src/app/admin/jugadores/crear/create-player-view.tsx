import { redirect } from 'next/navigation';
import { fetchTeamsForPlayer } from '../(actions)';
import { ROUTES } from '@/shared/constants/routes';
import { CreatePlayerForm } from '../(components)/create-player-form';

type Props = Readonly<{
  searchParamsPromise: Promise<{
    tournament?: string;
    category?: string;
  }>;
}>;

export const CreatePlayerView = async ({ searchParamsPromise }: Props) => {
  const { tournament, category } = await searchParamsPromise;

  const responseTeams = await fetchTeamsForPlayer({
    tournamentPermalink: tournament ?? '',
    categoryPermalink: category ?? '',
  });

  if (!responseTeams.ok) {
    redirect(`${ROUTES.ADMIN_PLAYERS}?error=${encodeURIComponent(responseTeams.message)}`);
  }

  const teams = responseTeams.teams!;

  return (
    <CreatePlayerForm
      teams={teams}
    />
  );
};
