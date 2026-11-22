import { Suspense, type FC } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EditPlayerView } from './edit-player-view';

type Props = Readonly<{
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ tournament?: string; category?: string }>;
}>;

const EditPlayerPage: FC<Props> = ({ params, searchParams }) => {
  return (
    <div className="admin-page">
      <Card className="admin-page-card">
        <CardHeader className="admin-page-card-header">
          <CardTitle
            className="admin-page-card-title"
            role="heading"
            aria-label="Título de la página"
          >
            Editar Jugador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense>
            <EditPlayerView
              paramsPromise={params}
              searchParamsPromise={searchParams}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPlayerPage;
