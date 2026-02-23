import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccessibilityProvider } from "@/contexts/accessibility-context";
import AccessibilityWrapper from "@/components/accessibility/accessibility-provider";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ChatButton } from "@/components/chat/chat-button";
import Home from "@/pages/home";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import ServicesPage from "@/pages/services-page";
import PharmacyServicesPage from "@/pages/services/pharmacy-services";
import MedicalServicesPage from "@/pages/services/medical-services";
import SpecialtiesPage from "@/pages/services/specialties-page";
import Search from "@/pages/search";
import AppointmentsPage from "@/pages/appointments";
import GalleryPage from "@/pages/gallery";
import TestimonialsPage from "@/pages/testimonials-page";
import ProductsPage from "@/pages/products-page";
import ProductCategoryPage from "@/pages/products/product-category";
import ProductSearchPage from "@/pages/products/product-search-page";
import ProductDetailPage from "@/pages/products/product-detail";
import TeamPage from "@/pages/team-page";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/simple-dashboard";
import UserApprovalPage from "@/pages/admin/user-approval";
import ContactManager from "@/pages/admin/contacto";
import ProductosManager from "@/pages/admin/productos";
import TestimoniosManager from "@/pages/admin/testimonios";
import CitasManager from "@/pages/admin/citas";
import BlogManager from "@/pages/admin/blog";
import ConfiguracionAdmin from "@/pages/admin/configuracion";
import AssistantConfig from "@/pages/admin/assistant-config";
import AdminEspecialidades from "@/pages/admin/especialidades";
import AdminDoctores from "@/pages/admin/doctores";
import DoctorPanel from "@/pages/admin/doctor-panel";
import AdminICalSync from "@/pages/admin/ical-sync";
import AdminPacientes from "@/pages/admin/pacientes";
import AdminAseguradoras from "@/pages/admin/aseguradoras";
import AdminPersonal from "@/pages/admin/personal";
import PrivacyPolicyPage from "@/pages/legal/privacy-policy";
import CookiesPolicyPage from "@/pages/legal/cookies-policy";
import TermsConditionsPage from "@/pages/legal/terms-conditions";
import { CookieConsent } from "@/components/cookie-consent";
import RegisterPage from "@/pages/auth/register";
import LoginPage from "@/pages/auth/login";
import MiCuentaPage from "@/pages/auth/mi-cuenta";
import MisCitasPage from "@/pages/auth/mis-citas";
import ConfigurationPage from "@/pages/auth/configuration";
import ContactPage from "@/pages/contact";
import ConsultasVirtualesPage from "@/pages/consultas-virtuales";
import ConsultaVirtualPage from "@/pages/consulta-virtual";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/servicios" component={ServicesPage} />
      <Route path="/servicios/farmacia" component={PharmacyServicesPage} />
      <Route path="/servicios/medicos" component={MedicalServicesPage} />
      <Route path="/servicios/especialidades" component={SpecialtiesPage} />
      <Route path="/buscar" component={Search} />
      <Route path="/citas" component={AppointmentsPage} />
      <Route path="/galeria" component={GalleryPage} />
      <Route path="/testimonios" component={TestimonialsPage} />
      <Route path="/productos" component={ProductsPage} />
      <Route path="/productos/buscar" component={ProductSearchPage} />
      <Route path="/productos/:category" component={ProductCategoryPage} />
      <Route path="/producto/:id" component={ProductDetailPage} />
      <Route path="/equipo" component={TeamPage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/usuarios" component={UserApprovalPage} />
      <Route path="/admin/especialidades" component={AdminEspecialidades} />
      <Route path="/admin/doctores" component={AdminDoctores} />
      <Route path="/admin/doctor-panel" component={DoctorPanel} />
      <Route path="/doctor" component={DoctorPanel} />
      <Route path="/admin/contacto" component={ContactManager} />
      <Route path="/admin/productos" component={ProductosManager} />
      <Route path="/admin/testimonios" component={TestimoniosManager} />
      <Route path="/admin/citas" component={CitasManager} />
      <Route path="/admin/pacientes" component={AdminPacientes} />
      <Route path="/admin/aseguradoras" component={AdminAseguradoras} />
      <Route path="/admin/personal" component={AdminPersonal} />
      <Route path="/admin/blog" component={BlogManager} />
      <Route path="/admin/ical" component={AdminICalSync} />
      <Route path="/admin/configuracion" component={ConfiguracionAdmin} />
      <Route path="/admin/asistente" component={AssistantConfig} />
      <Route path="/politica-privacidad" component={PrivacyPolicyPage} />
      <Route path="/politica-cookies" component={CookiesPolicyPage} />
      <Route path="/terminos-condiciones" component={TermsConditionsPage} />
      <Route path="/registro" component={RegisterPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/mi-cuenta" component={MiCuentaPage} />
      <Route path="/mi-cuenta/citas" component={MisCitasPage} />
      <Route path="/configuracion" component={ConfigurationPage} />
      <Route path="/contacto" component={ContactPage} />
      <Route path="/consultas-virtuales" component={ConsultasVirtualesPage} />
      <Route path="/consulta-virtual/:id" component={ConsultaVirtualPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <TooltipProvider>
          <AccessibilityWrapper>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1" id="main-content">
                <Router />
              </main>
              <Footer />
              <CookieConsent />
              <ChatButton />
            </div>
            <Toaster />
          </AccessibilityWrapper>
        </TooltipProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}

export default App;
