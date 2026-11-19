'use client';

import { type FC } from 'react';
import { Form } from '@/components/ui/form';
import { FormFields } from '../../(components)/form-fields';
import { useEditMatch } from './use-edit-match';
import type { MATCH_TYPE } from '@/app/admin/encuentros/(actions)/fetch-match.action';
import type { TOURNAMENT_TYPE } from '@/app/admin/encuentros/(actions)/fetch-tournaments-for-match.action';
import type { TEAM_TYPE } from '@/app/admin/encuentros/(actions)/fetch-teams-for-match-edit.action';
import type { CATEGORY_TYPE } from '@/app/admin/encuentros/(actions)/fetch-categories-for-match.action';
import type { FIELD_TYPE } from '@/app/admin/encuentros/(actions)/fetch-fields.action';
import { Button } from '@/components/ui/button';
import { MATCH_STATUS } from '@/shared/enums';
import { UpdateMatchScore } from '../../(components)/form-fields/update-match-score';
import { LoaderCircle } from 'lucide-react';

type Props = Readonly<{
  tournaments: TOURNAMENT_TYPE[];
  categories: CATEGORY_TYPE[];
  teams: TEAM_TYPE[];
  fields: FIELD_TYPE[];
  match: MATCH_TYPE;
}>;

export const EditMatchForm: FC<Props> = ({
  tournaments,
  categories,
  teams,
  fields,
  match,
}) => {
  const {
    form,
    onSubmit,
    handleNavigateBack,
    hiddenScores,
    setHiddenScores,
    isModifyingScores,
    setIsModifyingScores,
  } = useEditMatch(match);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormFields
          match={match}
          tournaments={tournaments}
          categories={categories}
          teams={teams}
          fields={fields}
          hiddenScores={hiddenScores}
        />

        <section>
          {hiddenScores && match.status === MATCH_STATUS.COMPLETED && (
            <Button
              type="button"
              variant="outline-info"
              onClick={() => {
                setIsModifyingScores(true);
                setHiddenScores(false);
              }}
              className="mb-3 w-full lg:absolute lg:top-5 lg:right-5 lg:mb-0 lg:w-fit"
            >
              modificar marcadores
            </Button>
          )}

          <div className="flex gap-3 lg:justify-end">
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

            {!hiddenScores && match?.status === MATCH_STATUS.COMPLETED && (
              <UpdateMatchScore
                match={match}
                setHiddenScores={(value) => {
                  setHiddenScores(value);
                  setIsModifyingScores(false);
                }}
              />
            )}

            {!isModifyingScores && (
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
                      <span role="status" className="text-sm italic">Espere</span>
                      <LoaderCircle
                        role="img"
                        aria-label="Icono de carga"
                        className="size-4 animate-spin"
                      />
                    </span>
                  ) : (
                    <span>guardar</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </section>
      </form>
    </Form>
  );
};
