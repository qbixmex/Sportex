import { Suspense, type FC } from 'react';
import { CustomSponsorsView } from './(components)/sponsors-view';

type Props = Readonly<{
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}>;

const SponsorsPage: FC<Props> = ({ searchParams }) => {
  return (
    <Suspense>
      <CustomSponsorsView searchParams={searchParams} />
    </Suspense>
  );
};

export default SponsorsPage;
