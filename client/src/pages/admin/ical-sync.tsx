import { Helmet } from 'react-helmet';
import PrivateLayout from '@/components/layout/private-layout';
import { ICalSync } from '@/components/admin/ical-sync';

export default function AdminICalSync() {
  return (
    <PrivateLayout>
      <Helmet>
        <title>Sincronización iCal | Administración - Farmacia Fátima Díaz Guillén</title>
        <meta 
          name="description" 
          content="Gestiona la sincronización de calendarios iCal para las citas médicas del Centro Médico Clodina." 
        />
      </Helmet>

      <div className="w-full max-w-7xl mx-auto">
        <ICalSync />
      </div>
    </PrivateLayout>
  );
}