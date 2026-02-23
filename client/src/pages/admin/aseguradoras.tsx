import PrivateLayout from '@/components/layout/private-layout';
import InsuranceCompaniesManager from '@/components/admin/insurance-companies-manager';

export default function InsuranceCompaniesPage() {
  return (
    <PrivateLayout>
      <InsuranceCompaniesManager />
    </PrivateLayout>
  );
}