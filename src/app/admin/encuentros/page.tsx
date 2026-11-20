import type { FC } from 'react';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MATCH_MODE_TYPE, MATCH_STATUS_TYPE } from '@/shared/enums';
import { ErrorHandler } from '@/shared/components/errorHandler';
import { SearchParamsSelectors } from '@/shared/components/search-params-selectors';
import { TournamentsSelectorSkeleton } from '../../(public)/components';
import { MatchesView } from './matches-view';
import { ClearFilters } from './(components)/clear-filters';
import { CreateMatchButtonSkeleton } from './(components)/create-match/create-match-skeleton';
import { CreateMatch } from './(components)/create-match';
import { Search } from './(components)/search';

type Props = Readonly<{
  searchParams: Promise<{
    query?: string;
    page?: string;
    tournament?: string;
    category?: string;
    status?: MATCH_STATUS_TYPE;
    mode?: MATCH_MODE_TYPE;
    'sort-week'?: 'asc' | 'desc';
    'sort-match-date'?: 'asc' | 'desc';
  }>;
}>;

export const MatchesPage: FC<Props> = ({ searchParams }) => {
  const tournamentPromise = searchParams.then(sp => ({ tournament: sp.tournament }));

  return (
    <>
      <ErrorHandler />
      <div className="admin-page">
        <Card className="admin-page-card">
          <CardHeader className="admin-page-card-header">
            <CardTitle className="admin-page-card-title">Encuentros</CardTitle>
            <section className="flex flex-col gap-5 mt-2 lg:mt-0 lg:flex-row lg:gap-2.5">
              <Search placeholder="ejemplo: chivas vs atlas" />
              <div className="w-full flex flex-row gap-3 lg:gap-2.5">
                <ClearFilters />
                <Suspense fallback={<CreateMatchButtonSkeleton />}>
                  <CreateMatch />
                </Suspense>
              </div>
            </section>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TournamentsSelectorSkeleton />}>
              <SearchParamsSelectors tournamentPromise={tournamentPromise} />
            </Suspense>
            <Suspense>
              <MatchesView searchParams={searchParams} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MatchesPage;
