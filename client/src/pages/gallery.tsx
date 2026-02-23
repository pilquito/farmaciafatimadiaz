import { FacilityGallery } from "@/components/gallery/facility-gallery";
import { Helmet } from "react-helmet";

export default function GalleryPage() {
  return (
    <>
      <Helmet>
        <title>Galería de Instalaciones | Farmacia Fátima Díaz Guillén y Centro Médico Clodina</title>
        <meta 
          name="description" 
          content="Explora nuestras modernas instalaciones de la Farmacia Fátima Díaz Guillén y el Centro Médico Clodina. Conoce nuestros espacios y equipamientos diseñados para ofrecerte la mejor atención."
        />
      </Helmet>
      
      <div className="pt-28">
        <FacilityGallery />
      </div>
    </>
  );
}