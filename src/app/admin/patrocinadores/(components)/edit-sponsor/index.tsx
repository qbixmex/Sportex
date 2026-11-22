import type { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/shared/constants/routes';
import { Pencil } from 'lucide-react';

type Props = Readonly<{ sponsorId: string; }>;

export const EditSponsor: FC<Props> = ({ sponsorId }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={ROUTES.ADMIN_SPONSORS_EDIT(sponsorId)}>
          <Button variant="outline-warning" size="icon">
            <Pencil />
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="left">
        editar
      </TooltipContent>
    </Tooltip>
  );
};
