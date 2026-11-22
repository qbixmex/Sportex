import { Suspense, type FC } from 'react';
import { CredentialView } from './credential-view';

type Props = Readonly<{
  params: Promise<{
    id: string;
  }>;
}>;

const CredentialPage: FC<Props> = ({ params }) => {
  return (
    <Suspense>
      <CredentialView params={params} />
    </Suspense>
  );
};

export default CredentialPage;
