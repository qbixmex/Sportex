import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CredentialForm } from '../(components)/CredentialForm';

const CreateMatchPage = () => {
  return (
    <div className="admin-page">
      <Card className="admin-page-card">
        <CardHeader className="admin-page-card-header">
          <CardTitle className="admin-page-card-title">Crear Credencial</CardTitle>
        </CardHeader>
        <CardContent>
          <CredentialForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMatchPage;
