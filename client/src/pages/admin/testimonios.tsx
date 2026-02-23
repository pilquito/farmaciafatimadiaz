import { Helmet } from 'react-helmet';
import PrivateLayout from '@/components/layout/private-layout';
import { TestimonialsManager } from '@/components/admin/testimonials-manager';

export default function AdminTestimonios() {
  return (
    <PrivateLayout>
      <Helmet>
        <title>Gestión de Testimonios | Administración</title>
      </Helmet>
      <div className="w-full p-6">
        <TestimonialsManager />
      </div>
    </PrivateLayout>
  );
}