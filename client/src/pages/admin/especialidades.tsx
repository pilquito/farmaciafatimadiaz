import { Helmet } from 'react-helmet';
import PrivateLayout from '@/components/layout/private-layout';
import { SpecialtiesManager } from '@/components/admin/specialties-manager';

export default function AdminEspecialidades() {
  return (
    <PrivateLayout>
      <Helmet>
        <title>Especialidades | Administración</title>
        <meta name="description" content="Gestión de especialidades médicas disponibles en el centro" />
      </Helmet>

      <div className="w-full p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Especialidades Médicas</h1>
          <p className="text-muted-foreground">
            Administra las especialidades médicas disponibles en el centro.
          </p>
        </div>

        <SpecialtiesManager />
      </div>
    </PrivateLayout>
  );
}