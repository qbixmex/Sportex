import type { FC } from 'react';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { buttonVariants } from '@/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import { Pencil } from 'lucide-react';

type Props = Readonly<{ teamId: string; }>;

export const EditTeam: FC<Props> = ({ teamId }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={ROUTES.ADMIN_TEAM_EDIT(teamId)}
          className={buttonVariants({
            variant: 'outline-info',
            size: 'icon',
          })}
        >
          <Pencil role="img" aria-label="Icono de lápiz" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top">
        editar
      </TooltipContent>
    </Tooltip>
  );
};
