'use server';

import prisma from '@/lib/prisma';
import { cacheLife, cacheTag } from 'next/cache';

export type ResponseFetchTeams = Promise<{
  ok: boolean;
  message: string;
  teams: {
    id: string;
    name: string;
  }[];
}>;

type Params = Readonly<{
  tournamentPermalink: string;
  categoryPermalink: string;
}>;

export const fetchTeamsForPlayer = async ({
  tournamentPermalink,
  categoryPermalink,
}: Params): ResponseFetchTeams => {
  'use cache';

  cacheLife('days');
  cacheTag('admin-teams-for-player');

  if (!tournamentPermalink || !categoryPermalink) {
    return {
      ok: false,
      message: 'El torneo y la categoría son obligatorios',
      teams: [],
    };
  }

  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' },
      where: {
        category: {
          permalink: categoryPermalink,
        },
        ...(tournamentPermalink === 'none'
          ? { tournamentId: null }
          : {
              tournament: {
                permalink: tournamentPermalink,
              },
            }),
      },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      ok: true,
      message: 'Los equipos fueron obtenidos correctamente',
      teams,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.log('Error al intentar obtener los equipos');
      return {
        ok: false,
        message: error.message,
        teams: [],
      };
    }
    console.log(error);
    return {
      ok: false,
      message: 'Error inesperado al obtener los equipos, revise los logs del servidor',
      teams: [],
    };
  }
};
