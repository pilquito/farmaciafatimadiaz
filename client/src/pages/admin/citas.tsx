import { Helmet } from 'react-helmet';
import PrivateLayout from '@/components/layout/private-layout';
import { AppointmentsManager } from '@/components/admin/appointments-manager-enhanced';

export default function AdminCitas() {
  return (
    <PrivateLayout>
      <Helmet>
        <title>Gestión de Citas | Administración</title>
        <meta 
          name="description" 
          content="Panel completo para la gestión de citas médicas, asignación de doctores y recursos, y seguimiento de pacientes."
        />
      </Helmet>
      <div className="w-full">
        <AppointmentsManager />
      </div>
    </PrivateLayout>
  );
}