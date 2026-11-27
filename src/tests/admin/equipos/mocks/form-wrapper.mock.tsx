import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { createTeamSchema } from '@/shared/schemas';

export const defaultTeamFormValues: {
  name: string;
  permalink: string;
  format: string;
  gender: string | undefined;
  country: string;
  state: string;
  city: string;
  coachId: string;
  emails: string[];
  address: string;
  fieldsIds: string[];
  active: boolean;
  categoryId: string;
  tournamentId: string;
} = {
  name: 'Equipo',
  permalink: 'equipo',
  format: '11',
  gender: 'male',
  country: 'México',
  state: 'Jalisco',
  city: 'Guadalajara',
  coachId: '',
  emails: [],
  address: 'Calle Falsa 123',
  fieldsIds: [],
  active: false,
  categoryId: '770e8400-e29b-41d4-a716-446655440003',
  tournamentId: '',
};

type Props = Readonly<{
  children: ReactNode;
  defaultValues?: Partial<typeof defaultTeamFormValues>;
}>;

export function TeamFormWrapper({
  children,
  defaultValues,
}: Props) {
  const form = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createTeamSchema) as any,
    defaultValues: {
      ...defaultTeamFormValues,
      ...defaultValues,
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}

export function FormValueDisplay({ name }: { name: string }) {
  const value = useWatch({ name });

  return <span data-testid={`${name}-value`}>{String(value ?? '')}</span>;
}

export function SetValue({ name, value }: { name: string; value: unknown }) {
  const { setValue } = useFormContext();

  useEffect(() => {
    setValue(name, value as never, { shouldValidate: true });
  }, [name, setValue, value]);

  return null;
}
