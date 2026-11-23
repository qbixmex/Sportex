'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { Controller, useFormContext } from 'react-hook-form';
import { MATCH_STATUS } from '@/shared/enums';
import { getStatusTranslation } from '@/lib/utils';
import { SelectGroup } from '@radix-ui/react-select';

type Props = Readonly<{
  isEditing?: boolean;
}>;

export const StatusField: FC<Props> = ({ isEditing = false }) => {
  const { control } = useFormContext();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <Controller
      name="status"
      control={control}
      render={({ field, fieldState }) => (
        <>
          <Field className="lg:max-w-50">
            <FieldLabel>Estado</FieldLabel>
            <Select
              value={field.value ?? ''}
              onValueChange={(value) => {
                if (isEditing && value === MATCH_STATUS.COMPLETED) {
                  setIsConfirmOpen(true);
                  return;
                }

                field.onChange(value);
              }}
            >
              <SelectTrigger aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Seleccione estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={MATCH_STATUS.IN_REVIEW}>
                    {getStatusTranslation(MATCH_STATUS.IN_REVIEW)}
                  </SelectItem>
                  <SelectItem value={MATCH_STATUS.SCHEDULED}>
                    {getStatusTranslation(MATCH_STATUS.SCHEDULED)}
                  </SelectItem>
                  <SelectItem value={MATCH_STATUS.IN_PROGRESS}>
                    {getStatusTranslation(MATCH_STATUS.IN_PROGRESS)}
                  </SelectItem>
                  <SelectItem value={MATCH_STATUS.POST_POSED}>
                    {getStatusTranslation(MATCH_STATUS.POST_POSED)}
                  </SelectItem>
                  <SelectItem value={MATCH_STATUS.CANCELED}>
                    {getStatusTranslation(MATCH_STATUS.CANCELED)}
                  </SelectItem>
                  {isEditing && (
                    <SelectItem value={MATCH_STATUS.COMPLETED}>
                      finalizado
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>

          {isEditing && (
            <AlertDialog
              open={isConfirmOpen}
              onOpenChange={setIsConfirmOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-center">
                    ¿ Confirmas que quieres finalizar el encuentro ?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-center text-orange-500 font-medium">
                    Al finalizar el encuentro el resultado final impactará la tabla de posiciones
                    y se recalcularán las estadísticas y los puntos obtenidos por cada equipo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className={buttonVariants({ variant: 'outline-secondary' })}
                  >
                    cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: 'outline-warning' })}
                    onClick={() => field.onChange(MATCH_STATUS.COMPLETED)}
                  >
                    proceder
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </>
      )}
    />
  );
};
