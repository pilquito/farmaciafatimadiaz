import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { PRODUCT_CATEGORIES } from "@/data/constants";

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title>Productos | Farmacia Fátima Díaz Guillén</title>
        <meta name="description" content="Explora nuestra amplia selección de productos farmacéuticos y parafarmacéuticos para el cuidado de tu salud y bienestar." />
      </Helmet>
      
      <div className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          {/* Cabecera */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-800 font-serif">Nuestros Productos</h1>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Explore nuestra amplia selección de productos farmacéuticos y parafarmacéuticos para el cuidado de su salud.
            </p>
            
            <div className="mt-8 flex justify-center">
              <Link href="/productos/buscar">
                <Button className="bg-primary hover:bg-primary-dark flex items-center gap-2">
                  <i className="fas fa-search"></i>
                  <span>Buscar productos</span>
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Categorías */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {PRODUCT_CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                className="bg-white rounded-lg shadow-md overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/productos/${category.id}`}>
                  <div className="p-8 flex flex-col items-center text-center cursor-pointer h-full">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <i className={`${category.icon} text-2xl text-primary`}></i>
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-neutral-800 group-hover:text-primary transition-colors">{category.name}</h2>
                    <p className="text-neutral-600 mb-6">{category.description}</p>
                    <div className="mt-auto">
                      <span className="inline-flex items-center text-primary font-medium group-hover:underline">
                        Ver productos
                        <i className="fas fa-chevron-right ml-2 text-sm transition-transform group-hover:translate-x-1"></i>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          {/* Características */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4 font-serif">¿Por qué elegir nuestros productos?</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                En Farmacia Fátima Díaz Guillén nos comprometemos a ofrecerle productos de la más alta calidad con el mejor servicio profesional.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-medal text-2xl text-primary"></i>
                </div>
                <h3 className="text-lg font-bold mb-2 text-neutral-800">Calidad garantizada</h3>
                <p className="text-neutral-600">
                  Todos nuestros productos cumplen con los más altos estándares de calidad y son seleccionados cuidadosamente.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-truck-fast text-2xl text-primary"></i>
                </div>
                <h3 className="text-lg font-bold mb-2 text-neutral-800">Envío rápido</h3>
                <p className="text-neutral-600">
                  Enviamos sus productos en el menor tiempo posible. Envío gratuito en pedidos superiores a 50€.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-headset text-2xl text-primary"></i>
                </div>
                <h3 className="text-lg font-bold mb-2 text-neutral-800">Asesoramiento profesional</h3>
                <p className="text-neutral-600">
                  Nuestro equipo de farmacéuticos está disponible para resolver todas sus dudas sobre nuestros productos.
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="bg-primary/5 rounded-lg p-8 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2 font-serif">¿No encuentra lo que busca?</h2>
              <p className="text-neutral-600 max-w-2xl">
                Si no encuentra el producto que necesita, contáctenos y haremos lo posible por conseguirlo para usted.
              </p>
            </div>
            <Link href="/contacto">
              <Button className="mt-4 md:mt-0 bg-primary hover:bg-primary-dark">
                Contactar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}