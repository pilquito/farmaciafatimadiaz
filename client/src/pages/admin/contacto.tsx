import { Helmet } from 'react-helmet';
import PrivateLayout from '@/components/layout/private-layout';
import { ContactManagerEnhanced } from '@/components/admin/contact-manager-enhanced';

export default function AdminContacto() {
  return (
    <PrivateLayout>
      <Helmet>
        <title>Gestión de Mensajes | Administración</title>
      </Helmet>
      <ContactManagerEnhanced />
    </PrivateLayout>
  );
}