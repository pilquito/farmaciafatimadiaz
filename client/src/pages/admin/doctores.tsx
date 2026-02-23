import { Helmet } from 'react-helmet';
import PrivateLayout from '@/components/layout/private-layout';
import { DoctorsManager } from '@/components/admin/doctors-manager';

export default function AdminDoctores() {
  return (
    <PrivateLayout>
      <Helmet>
        <title>Doctores | Administración</title>
        <meta name="description" content="Gestión de doctores y profesionales del centro médico" />
      </Helmet>

      <div className="w-full p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Gestión de Doctores</h1>
          <p className="text-muted-foreground">
            Administra los doctores y profesionales del centro médico.
          </p>
        </div>

        <DoctorsManager />
      </div>
    </PrivateLayout>
  );
}