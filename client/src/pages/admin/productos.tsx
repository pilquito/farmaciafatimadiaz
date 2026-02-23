import { Helmet } from 'react-helmet';
import PrivateLayout from '@/components/layout/private-layout';
import { ProductsManager } from '@/components/admin/products-manager';

export default function AdminProductos() {
  return (
    <PrivateLayout>
      <Helmet>
        <title>Gestión de Productos | Administración</title>
      </Helmet>
      <div className="w-full p-6">
        <ProductsManager />
      </div>
    </PrivateLayout>
  );
}