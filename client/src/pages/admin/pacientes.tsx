import { Helmet } from 'react-helmet';
import PrivateLayout from '@/components/layout/private-layout';
import { PatientsManager } from '@/components/admin/patients-manager';

export default function AdminPacientes() {
  return (
    <PrivateLayout>
      <Helmet>
        <title>Gestión de Pacientes | Administración</title>
        <meta 
          name="description" 
          content="Panel completo para la gestión de fichas médicas de pacientes, historial clínico y datos personales."
        />
      </Helmet>
      <div className="w-full">
        <PatientsManager />
      </div>
    </PrivateLayout>
  );
}