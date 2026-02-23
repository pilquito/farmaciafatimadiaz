import { Helmet } from 'react-helmet';
import PrivateLayout from '@/components/layout/private-layout';
import { BlogManager } from '@/components/admin/blog-manager';

export default function AdminBlog() {
  return (
    <PrivateLayout>
      <Helmet>
        <title>Gestión del Blog | Administración</title>
      </Helmet>
      <div className="w-full p-6">
        <BlogManager />
      </div>
    </PrivateLayout>
  );
}