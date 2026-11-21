import type { FC } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ROUTES } from '@/shared/constants/routes';

type Props = Readonly<{ credentialId: string; }>;

export const EditCredential: FC<Props> = ({ credentialId }) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Link
          href={ROUTES.ADMIN_CREDENTIALS_EDIT(credentialId)}
          className={buttonVariants({
            variant: 'outline-warning',
            size: 'icon',
          })}
        >
          <Pencil />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="left">
        editar
      </TooltipContent>
    </Tooltip>
  );
};
