import { Helmet } from 'react-helmet';
import PrivateLayout from '@/components/layout/private-layout';
import { UserApprovalPanel } from '@/components/admin/user-approval';

export default function UserApprovalPage() {
  return (
    <PrivateLayout>
      <Helmet>
        <title>Gestión de Usuarios | Administración</title>
        <meta name="description" content="Administra usuarios, aprueba nuevas cuentas y gestiona permisos de acceso." />
      </Helmet>
      <div className="w-full p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
          <p className="text-neutral-600">
            Administra cuentas de usuarios, aprueba nuevos registros y gestiona permisos de acceso.
          </p>
        </div>
        
        <UserApprovalPanel />
      </div>
    </PrivateLayout>
  );
}