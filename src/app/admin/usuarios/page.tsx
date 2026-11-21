import type { FC } from 'react';
import { Suspense } from 'react';
import { UsersView } from './users-view';

type Props = Readonly<{
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}>;

const UsersPage: FC<Props> = ({ searchParams }) => {
  return (
    <Suspense>
      <UsersView searchParams={searchParams} />
    </Suspense>
  );
};

export default UsersPage;
