'use client';

import type { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DeleteTeam } from '../(components)/delete-team';
import { updateTeamStateAction } from '../(actions)';
import { Pagination } from '@/shared/components/pagination';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ActiveSwitch } from '@/shared/components/active-switch';
import type { TEAM_TYPE } from '../(actions)/fetch-admin-teams.action';
import { ROUTES } from '@/shared/constants/routes';
import { EmptyMessageResource } from '@/shared/components/empty-message-resource';
import { ShowTeam } from './show-team';
import { EditTeam } from './edit-team';

type Props = Readonly<{
  teams: TEAM_TYPE[];
  pagination: {
    currentPage: number;
    totalPages: number;
  };
  roles: string[];
}>;

export const TeamsTable: FC<Props> = ({ teams, pagination, roles }) => {
  return (
    <>
      {(teams.length > 0) ? (
        <div className="flex-1 flex flex-col mt-10">
          <div className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead className="w-25">Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-25 text-center">Formato</TableHead>
                  <TableHead className="w-25 text-center">Rama</TableHead>
                  <TableHead className="w-25">Entrenador</TableHead>
                  <TableHead className="w-25 text-center">Jugadores</TableHead>
                  <TableHead className="w-25 text-center">Activo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team, index) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-bold text-center">{index + 1}</TableCell>
                    <TableCell>
                      <Link href={ROUTES.ADMIN_TEAMS_SHOW(team.id)}>
                        {
                          !team.imageUrl ? (
                            <figure className="bg-gray-800 size-[60px] rounded-xl flex items-center justify-center">
                              <Flag
                                size={35}
                                className="stroke-gray-400"
                                role="img"
                                aria-label={`${team.name} icono`}
                              />
                            </figure>
                          ) : (
                            <Image
                              src={team.imageUrl}
                              alt={`${team.name} picture`}
                              width={75}
                              height={75}
                              className="size-18 rounded-xl object-cover"
                            />
                          )
                        }
                      </Link>
                    </TableCell>
                    <TableCell>{team.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline-info">
                        {team.format} vs {team.format}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {(team.gender === 'male') && (
                        <Badge variant="outline-info">varonil</Badge>
                      )}
                      {(team.gender === 'female') && (
                        <Badge variant="outline" className="border-pink-500 text-pink-500">
                          femenil
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {team.coach ? (
                        <Link href={`${ROUTES.ADMIN_COACHES_SHOW(team.coach.id)}`}>
                          <Badge variant="outline-info">
                            <p className="text-wrap" data-testid="coach-name">
                              {team.coach.name}
                            </p>
                          </Badge>
                        </Link>
                      ) : (
                        <Badge
                          variant="outline-secondary"
                          data-testid="coach-badge"
                        >
                          no asignado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline-info">{team.playersCount}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <ActiveSwitch
                        resource={{ id: team.id, state: team.active }}
                        updateResourceStateAction={updateTeamStateAction}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-3">
                        <ShowTeam teamId={team.id} />
                        <EditTeam teamId={team.id} />
                        <DeleteTeam teamId={team.id} roles={roles} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div
            className={cn('flex justify-center mt-10', {
              hidden: pagination!.totalPages === 1,
            })}
          >
            <Pagination totalPages={pagination!.totalPages as number} />
          </div>
        </div>
      ) : (
        <EmptyMessageResource>
          No se encontraron equipos
        </EmptyMessageResource>
      )}
    </>
  );
};

export default TeamsTable;
