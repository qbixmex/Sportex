import type { FC } from 'react';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorHandler } from '@/shared/components/errorHandler';
import { Search } from '@/shared/components/search';
import type { MATCH_STATUS_TYPE } from '@/shared/enums';
import { PlayoffsMatchesView } from './playoff-matches-view';
import { ClearFilters } from './(components)/clear-filters';
import { CreateMatch } from './(components)/create-match';
import { CreateMatchSkeleton } from './(components)/create-match.skeleton';
import { PlayoffMatchesSkeleton } from './(components)/playoff-matches.skeleton';

type Props = Readonly<{
  params: Promise<{ playoff_id: string }>;
  searchParams: Promise<{
    query?: string;
    page?: string;
    tournament?: string;
    category?: string;
    status?: MATCH_STATUS_TYPE;
    'sort-match-date'?: 'asc' | 'desc';
  }>;
}>;

export const PlayoffsMatchesPage: FC<Props> = ({ params, searchParams }) => {
  const playoffIdPromise = params.then((params) => params.playoff_id);

  return (
    <>
      <ErrorHandler />
      <div className="admin-page">
        <Card className="admin-page-card">
          <CardHeader className="admin-page-card-header">
            <CardTitle className="admin-page-card-title">
              Encuentros de Liguilla
            </CardTitle>
            <section className="flex gap-2.5">
              <Search placeholder="ejemplo: chivas vs atlas" />
              <ClearFilters />
              <Suspense fallback={<CreateMatchSkeleton />}>
                <CreateMatch playoffIdPromise={playoffIdPromise} />
              </Suspense>
            </section>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<PlayoffMatchesSkeleton />}>
              <PlayoffsMatchesView
                playoffIdPromise={playoffIdPromise}
                searchParams={searchParams}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PlayoffsMatchesPage;
