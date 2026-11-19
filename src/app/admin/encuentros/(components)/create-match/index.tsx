'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { buttonVariants } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ROUTES } from '@/shared/constants/routes';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const CreateMatch = () => {
  const searchParams = useSearchParams();

  const params = new URLSearchParams();
  const tournament = searchParams.get('tournament');
  const category = searchParams.get('category');

  if (tournament) params.set('tournament', tournament);
  if (category) params.set('category', category);

  const queryString = params.toString();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={
            queryString
              ? `${ROUTES.ADMIN_MATCHES_CREATE}?${queryString}`
              : ROUTES.ADMIN_MATCHES_CREATE
          }
          className={
            cn(
              buttonVariants({
                variant: 'outline-primary',
                size: 'default',
              }),
              'flex-1 lg:flex-none lg:w-fit! lg:size-9!',
            )
          }
          aria-label="Ir a crear encuentro"
        >
          <span className="lg:hidden">crear encuentro</span>{' '}
          <Plus strokeWidth={3} aria-hidden="true" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="left">crear</TooltipContent>
    </Tooltip>
  );
};
