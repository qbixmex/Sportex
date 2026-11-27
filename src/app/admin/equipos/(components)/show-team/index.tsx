import type { FC } from 'react';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { buttonVariants } from '@/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import { InfoIcon } from 'lucide-react';

type Props = Readonly<{ teamId: string; }>;

export const ShowTeam: FC<Props> = ({ teamId }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={ROUTES.ADMIN_TEAMS_SHOW(teamId)}
          className={buttonVariants({
            variant: 'outline-info',
            size: 'icon',
          })}
          aria-label="Ver información del equipo"
        >
          <InfoIcon
            role="img"
            aria-label="Icono de información"
          />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top">
        detalles
      </TooltipContent>
    </Tooltip>
  );
};
