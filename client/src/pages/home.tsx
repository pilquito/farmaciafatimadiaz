import { InteractiveHero } from "@/components/home/interactive-hero";
import { AboutUs } from "@/components/home/about-us";
import { Services } from "@/components/home/services";
import { ProductsShelf } from "@/components/home/products-shelf";
import { Consultation } from "@/components/home/consultation";
import { BlogSection } from "@/components/home/blog-section";
import { Testimonials } from "@/components/home/testimonials";
import { InstagramSection } from "@/components/home/instagram-section";
import { ContactSection } from "@/components/home/contact-section";

export default function Home() {
  return (
    <>
      <InteractiveHero />
      <AboutUs />
      <Services />
      <ProductsShelf />
      <Consultation />
      <BlogSection />
      <Testimonials />
      <InstagramSection />
      <ContactSection />
    </>
  );
}
