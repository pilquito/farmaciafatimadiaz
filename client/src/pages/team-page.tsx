import { Helmet } from "react-helmet";
import { PageHeader } from "@/components/ui/page-header";
import TeamProfessionalCards from "@/components/team-professional-cards";

export default function TeamPage() {
  return (
    <>
      <Helmet>
        <title>Nuestro Equipo | Farmacia Fátima Díaz Guillén y Centro Médico Clodina</title>
        <meta name="description" content="Conozca a nuestro equipo de profesionales farmacéuticos y médicos dedicados a ofrecer la mejor atención sanitaria para usted y su familia." />
      </Helmet>
      
      <PageHeader 
        title="Nuestro Equipo" 
        description="Conozca a los profesionales dedicados a cuidar de su salud"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Equipo", href: "/equipo", active: true }
        ]}
      />
      
      <section className="container mx-auto px-4 py-12">
        <TeamProfessionalCards />
      </section>
    </>
  );
}