import { Suspense, type FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomPageDetailsView } from './custom-page-details-view';

type Props = Readonly<{
  params: Promise<{
    id: string;
  }>;
}>;

export const PageDetails: FC<Props> = ({ params }) => {
  return (
    <div className="admin-page">
      <Card className="admin-page-card">
        <CardHeader className="admin-page-card-header">
          <CardTitle
            className="admin-page-card-title"
            role="heading"
            aria-label="Título de la página"
          >
            Detalles de la página
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense>
            <CustomPageDetailsView params={params} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageDetails;
