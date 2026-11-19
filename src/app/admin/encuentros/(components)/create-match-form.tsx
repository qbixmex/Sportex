'use client';

import { Fragment, type FC } from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import type { TOURNAMENT_TYPE } from '@/app/admin/encuentros/(actions)/fetch-tournaments-for-match.action';
import type { TEAM_TYPE } from '@/app/admin/encuentros/(actions)/fetch-teams-for-match-create.action';
import type { CATEGORY_TYPE } from '@/app/admin/encuentros/(actions)/fetch-categories-for-match.action';
import type { FIELD_TYPE } from '@/app/admin/encuentros/(actions)/fetch-fields.action';
import { FormFields } from '../(components)/form-fields';
import { useCreateMatch } from '../crear/use-create-match';

type Props = Readonly<{
  tournaments: TOURNAMENT_TYPE[];
  categories: CATEGORY_TYPE[];
  teams: TEAM_TYPE[];
  fields: FIELD_TYPE[];
  defaultTournament?: string;
  defaultCategory?: string;
}>;

export const CreateMatchForm: FC<Props> = ({
  tournaments,
  categories,
  teams,
  fields,
  defaultTournament,
  defaultCategory,
}) => {
  const { form, onSubmit, handleNavigateBack } = useCreateMatch({
    defaultTournament,
    defaultCategory,
  });

  return (
    <section className="mt-10">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <FormFields
            tournaments={tournaments}
            categories={categories}
            teams={teams}
            fields={fields}
          />

          <section className="flex gap-3 lg:justify-end">
            <div className="w-1/2 lg:w-fit">
              <Button
                type="button"
                variant="outline-secondary"
                size="lg"
                onClick={handleNavigateBack}
                className="w-full lg:w-fit"
              >
                cancelar
              </Button>
            </div>
            <div className="w-1/2 lg:w-fit">
              <Button
                type="submit"
                variant="outline-primary"
                size="lg"
                disabled={form.formState.isSubmitting}
                className="w-full lg:w-fit"
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center gap-2 text-secondary-foreground animate-pulse">
                    <span className="text-sm italic">Espere</span>
                    <LoaderCircle
                      className="size-4 animate-spin"
                      role="img"
                      aria-label="Icono de carga"
                    />
                  </span>
                ) : (
                  <Fragment>crear</Fragment>
                )}
              </Button>
            </div>
          </section>
        </form>
      </Form>
    </section>
  );
};
