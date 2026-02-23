import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { InstagramFeed } from "@/components/ui/instagramFeed";

export function InstagramSection() {
  return (
    <section id="instagram" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">Síguenos en Instagram</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-neutral-700 max-w-2xl mx-auto">
            Mantente al día con nuestras novedades, consejos de salud y ofertas especiales.
          </p>
        </motion.div>
        
        <InstagramFeed />
        
        <div className="text-center mt-10">
          <a 
            href="https://www.instagram.com/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 inline-flex items-center">
              <i className="fab fa-instagram mr-2"></i>
              <span>Seguirnos en Instagram</span>
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
