'use server';

import prisma from '@/lib/prisma';
import { updateTag } from 'next/cache';
import { requireAdmin } from '@/lib/get-session';
import { Prisma } from '@/generated/prisma/client';
import {
  MATCH_MODE,
  MATCH_STATUS,
  SHOOTOUT_STATUS,
} from '@/shared/enums';

export type ResponseDeleteAction = Promise<{
  ok: boolean;
  message: string;
}>;

type StandingsSnapshot = {
  id: string;
  teamId: string;
  additionalPoints: number;
  totalPoints: number;
};

type StandingsUpdateData = {
  matchesPlayed?: { decrement: number };
  wins?: { decrement: number };
  draws?: { decrement: number };
  losses?: { decrement: number };
  goalsFor?: { decrement: number };
  goalsAgainst?: { decrement: number };
  goalsDifference?: { decrement: number };
  points?: { decrement: number };
  additionalPoints?: { decrement: number };
  totalPoints?: { decrement: number };
};

const buildStandingsUpdate = ({
  standings,
  points,
  goalsFor,
  goalsAgainst,
  hasResult,
  additionalPoints,
}: {
  standings: StandingsSnapshot;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  hasResult: boolean;
  additionalPoints: number;
}): StandingsUpdateData => {
  // Only subtract the shootout point when the standings row still has it,
  // mirroring delete-penalty-shootout.action.ts.
  const additionalPointsToRevert = (
    additionalPoints > 0 &&
    standings.additionalPoints > 0 &&
    standings.totalPoints > 0
  ) ? additionalPoints : 0;

  const resultPoints = hasResult ? points : 0;

  return {
    ...(hasResult
      ? {
          matchesPlayed: { decrement: 1 },
          wins: { decrement: points === 3 ? 1 : 0 },
          draws: { decrement: points === 1 ? 1 : 0 },
          losses: { decrement: points === 0 ? 1 : 0 },
          goalsFor: { decrement: goalsFor },
          goalsAgainst: { decrement: goalsAgainst },
          goalsDifference: { decrement: goalsFor - goalsAgainst },
          points: { decrement: points },
        }
      : {}),
    ...(additionalPointsToRevert > 0
      ? { additionalPoints: { decrement: additionalPointsToRevert } }
      : {}),
    ...(hasResult || additionalPointsToRevert > 0
      ? { totalPoints: { decrement: resultPoints + additionalPointsToRevert } }
      : {}),
  };
};

export const deleteMatchAction = async (id: string): ResponseDeleteAction => {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return {
      ok: false,
      message: guard.message,
    };
  }

  try {
    const match = await prisma.match.findFirst({
      where: { id },
      select: {
        id: true,
        status: true,
        mode: true,
        localId: true,
        visitorId: true,
        localScore: true,
        visitorScore: true,
        tournamentId: true,
        categoryId: true,
        penaltyShootout: {
          select: {
            status: true,
            winnerTeamId: true,
          },
        },
      },
    });

    if (!match) {
      return {
        ok: false,
        message: 'No se puede eliminar el encuentro, quizás fue eliminado ó no existe',
      };
    }

    const isLeague = match.mode === MATCH_MODE.LEAGUE;
    const isCompleted = match.status === MATCH_STATUS.COMPLETED;

    const localScore = match.localScore ?? 0;
    const visitorScore = match.visitorScore ?? 0;

    // Points from the regular match score, same rules used when the match
    // was finished or its score was updated.
    let localPoints = 0;
    let visitorPoints = 0;

    if (localScore > visitorScore) {
      localPoints = 3;
    } else if (localScore < visitorScore) {
      visitorPoints = 3;
    } else {
      localPoints = 1;
      visitorPoints = 1;
    }

    const shootoutWinnerId = (
      match.penaltyShootout?.status === SHOOTOUT_STATUS.COMPLETED
        ? match.penaltyShootout.winnerTeamId
        : null
    );

    const localAdditionalPoints = shootoutWinnerId === match.localId ? 1 : 0;
    const visitorAdditionalPoints = shootoutWinnerId === match.visitorId ? 1 : 0;
    const shouldRevertStandings = isLeague && (
      isCompleted ||
      localAdditionalPoints > 0 ||
      visitorAdditionalPoints > 0
    );

    // Standings rows are resolved before opening the transaction so a missing
    // row never blocks deleting the match.
    const standings = shouldRevertStandings
      ? await prisma.standings.findMany({
          where: {
            tournamentId: match.tournamentId,
            categoryId: match.categoryId,
            teamId: { in: [match.localId, match.visitorId] },
          },
          select: {
            id: true,
            teamId: true,
            additionalPoints: true,
            totalPoints: true,
          },
        })
      : [];

    const localStandings = standings.find((standing) => standing.teamId === match.localId);
    const visitorStandings = standings.find((standing) => standing.teamId === match.visitorId);

    await prisma.$transaction(async (transaction) => {
      if (localStandings) {
        const localData = buildStandingsUpdate({
          standings: localStandings,
          points: localPoints,
          goalsFor: localScore,
          goalsAgainst: visitorScore,
          hasResult: isLeague && isCompleted,
          additionalPoints: localAdditionalPoints,
        });

        if (Object.keys(localData).length > 0) {
          await transaction.standings.update({
            where: { id: localStandings.id },
            data: localData,
          });
        }
      }

      if (visitorStandings) {
        const visitorData = buildStandingsUpdate({
          standings: visitorStandings,
          points: visitorPoints,
          goalsFor: visitorScore,
          goalsAgainst: localScore,
          hasResult: isLeague && isCompleted,
          additionalPoints: visitorAdditionalPoints,
        });

        if (Object.keys(visitorData).length > 0) {
          await transaction.standings.update({
            where: { id: visitorStandings.id },
            data: visitorData,
          });
        }
      }

      await transaction.match.delete({ where: { id: match.id } });
    });

    updateTag('admin-matches');
    updateTag('admin-match');
    updateTag('matches');
    updateTag('dashboard-results');
    updateTag('public-matches');
    updateTag('public-results');
    updateTag('public-results-roles');
    updateTag('public-result-details');
    updateTag('public-matches-count');
    updateTag('admin-tournament-for-match');
    updateTag('public-team-matches');
    updateTag('public-team-standings');
    updateTag('public-playoff-matches');
    updateTag('public-playoff');

    if (shouldRevertStandings) {
      updateTag('admin-standings');
      updateTag('admin-tournaments-for-standings');
      updateTag('public-standings');
    }

    return {
      ok: true,
      message: 'El encuentro ha sido eliminado correctamente',
    };
  } catch (error) {
    let errorMessage = 'Error inesperado';

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const fieldError = (error.meta as { target?: string[] } | undefined)?.target?.[0];

      if (error.code === 'P2001') {
        errorMessage = `El campo "${fieldError}" no existe`;
      } else if (error.code === 'P2002') {
        errorMessage = `El campo "${fieldError}" está duplicado`;
      } else {
        errorMessage = 'Error al eliminar el encuentro';
      }

      console.log('='.repeat(20) + ' PRISMA ERROR ' + '='.repeat(20));
      console.log('CAUSE:', error.cause);
      console.log('NAME:', error.name);
      console.log('META:', error.meta);
      console.log('MESSAGE:', error.message);
      console.log('='.repeat(54));
    } else if (error instanceof Error) {
      console.log('CAUSE:', error.cause);
      console.log('NAME:', error.name);
      console.log('MESSAGE:', error.message);
    } else {
      console.log(error);
    }

    return {
      ok: false,
      message: `${errorMessage}, revise los logs del servidor`,
    };
  }
};
