import { Suspense, type FC } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlayOffDetailsView } from './playoff-details-view';
import { PlayoffDetailsSkeleton } from './playoff-details.skeleton';

type Props = Readonly<{
  params: Promise<{
    playoff_id: string;
  }>;
}>;

export const PlayoffPage: FC<Props> = ({ params }) => {
  return (
    <div className="admin-page">
      <Card className="admin-page-card">
        <CardHeader className="admin-page-card-header">
          <div className="w-full flex justify-between">
            <CardTitle className="admin-page-card-title">Detalles de la Liguilla</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PlayoffDetailsSkeleton />}>
            <PlayOffDetailsView params={params} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayoffPage;
