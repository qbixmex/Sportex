import type { FC } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import {
  type MatchType,
  fetchResultDetailsAction,
} from '../../(actions)/fetchResultDetailsAction';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import { MatchStatus } from './match-status';
import { MATCH_STATUS } from '@/shared/enums';
import type { MATCH_STATUS_TYPE } from '@/shared/enums';
import { PenaltyShootout } from '@/shared/components/penalty-shootouts';
import { ROUTES } from '@/shared/constants/routes';
import { getMatchMode } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { FieldsMap } from '@/shared/components/fields-map';
import { MatchResults } from '@/shared/components/match-results';
import { resolveFieldMaps } from '@/lib/maps';
import styles from './styles.module.css';

const TIME_ZONE = 'America/Mexico_City';

type Props = Readonly<{
  matchId: string;
}>;

export const MatchDetails: FC<Props> = async ({ matchId }) => {
  const result = await fetchResultDetailsAction(matchId);

  if (!result.ok) {
    redirect(
      ROUTES.PUBLIC_RESULTS +
      '?error=' +
      encodeURIComponent(result.message),
    );
  }

  const match = result.match as MatchType;

  const tournament = (match as MatchType).tournament;
  const localTeam = (match as MatchType).local;
  const visitorTeam = (match as MatchType).visitor;
  const matchField = (match as MatchType).field;
  const fieldMaps = matchField ? await resolveFieldMaps([matchField]) : [];

  return (
    <>
      <section className={styles.mainWrapper}>
        <section className={styles.halfColumn}>
          <MatchResults
            local={{
              name: localTeam.name,
              href:
                `${ROUTES.PUBLIC_TEAMS}/${localTeam.permalink}` +
                `?tournament=${tournament.permalink}` +
                `&category=${localTeam.category?.permalink}`,
              imageUrl: localTeam.imageUrl,
            }}
            visitor={{
              name: visitorTeam.name,
              href:
                `${ROUTES.PUBLIC_TEAMS}/${visitorTeam.permalink}` +
                `?tournament=${tournament.permalink}` +
                `&category=${visitorTeam.category?.permalink}`,
              imageUrl: visitorTeam.imageUrl,
            }}
            localScore={match?.localScore}
            visitorScore={match?.visitorScore}
          />
        </section>

        <section className={styles.halfColumn}>
          <Table>
            <TableBody>
              <TableRow>
                <TableHead>Torneo</TableHead>
                <TableCell aria-label="Torneo del encuentro">
                  <Link
                    href={ROUTES.PUBLIC_TOURNAMENT_SHOW(tournament.permalink)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <p className={styles.tournamentName}>{tournament.name}</p>
                  </Link>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableCell>
                  {match.category ? (
                    <span role="text" aria-label="Categoría del encuentro">
                      {match.category.name}
                    </span>
                  ) : (
                    <span role="text" aria-label="Categoría del encuentro">
                      No disponible
                    </span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Formato</TableHead>
                <TableCell>
                  <span role="text" aria-label="Formato del encuentro">
                    {match.local.format} vs {match.visitor.format}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead>País</TableHead>
                <TableCell>
                  <span role="text" aria-label="País del torneo">
                    {tournament.country}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Temporada</TableHead>
                <TableCell>
                  <span role="text" aria-label="Temporada del torneo">
                    {tournament.season}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Modalidad</TableHead>
                <TableCell>
                  <Badge
                    variant={
                      (match.mode === 'league')
                        ? 'outline-primary'
                        : 'outline-special'
                    }
                    className={styles.modeBadge}
                    aria-label="Modalidad del encuentro"
                  >
                    {getMatchMode(match.mode)}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>
      </section>

      {fieldMaps.length > 0 && (
        <FieldsMap maps={fieldMaps} className={styles.fieldMap} />
      )}

      <h2 className={styles.sectionHeading}>Información Adicional</h2>

      <section className={styles.additionalInfoGrid}>
        <div className={styles.halfColumn}>
          <Table>
            <TableBody>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableCell>
                  <p
                    className={styles.matchDate}
                    role="text"
                    aria-label="Fecha del encuentro"
                  >
                    <span>
                      {`${formatInTimeZone(match?.matchDate as Date, TIME_ZONE, 'dd', { locale: es })}`}
                    </span>
                    <span>{' de '}</span>
                    <span className={styles.capitalized}>
                      {formatInTimeZone(match?.matchDate as Date, TIME_ZONE, 'LLLL', { locale: es })}
                    </span>
                    <span>{' del '}</span>
                    <span>
                      &nbsp;{formatInTimeZone(match?.matchDate as Date, TIME_ZONE, 'y', { locale: es })}
                    </span>
                  </p>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableCell>
                  <span role="text" aria-label="Hora del encuentro">
                    {formatInTimeZone(match?.matchDate as Date, TIME_ZONE, 'h:mm aaa', { locale: es })}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Estado</TableHead>
                <TableCell>
                  <div role="text" aria-label="Estado del encuentro">
                    <MatchStatus status={match?.status as MATCH_STATUS_TYPE} />
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className={styles.halfColumn}>
          <Table>
            <TableBody>
              <TableRow>
                <TableHead>Jornada</TableHead>
                <TableCell>
                  <span role="text" aria-label="Jornada del encuentro">
                    {match?.week ?? 'No especificada'}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Sede</TableHead>
                <TableCell>
                  <span role="text" aria-label="Sede del encuentro">
                    {match?.field?.name ?? 'No especificado'}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead>Arbitro</TableHead>
                <TableCell>
                  <span role="text" aria-label="Árbitro del encuentro">
                    {match?.referee ?? 'No especificado'}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        {
          (
            (match?.status === MATCH_STATUS.COMPLETED) &&
            (match.localScore === match.visitorScore)
          ) && (
            <>
              <div className={styles.divider} />
              <h2 className={`${styles.sectionHeading} ${styles.sectionHeadingSpaced}`}>
                Tanda de Penales
              </h2>
              <section className={styles.additionalInfoGrid}>
                <div className={styles.halfColumn}>
                  <PenaltyShootout shootout={match.penaltyShootout} />
                </div>
              </section>
            </>
          )
        }
      </section>
    </>
  );
};
