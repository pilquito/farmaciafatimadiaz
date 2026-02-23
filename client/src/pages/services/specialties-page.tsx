import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { CONSULTATIONS } from "@/data/constants";

export default function SpecialtiesPage() {
  return (
    <>
      <Helmet>
        <title>Especialidades Médicas | Centro Médico Clodina</title>
        <meta name="description" content="Conozca todas nuestras especialidades médicas. Ofrecemos atención especializada con profesionales altamente cualificados para cuidar de su salud." />
      </Helmet>
      
      <div className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          {/* Migas de pan */}
          <div className="mb-6 text-sm breadcrumbs">
            <ul className="flex items-center space-x-2">
              <li>
                <Link href="/">
                  <span className="text-neutral-500 hover:text-primary cursor-pointer">Inicio</span>
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-neutral-400">/</span>
                <Link href="/servicios">
                  <span className="text-neutral-500 hover:text-primary cursor-pointer">Servicios</span>
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-neutral-400">/</span>
                <Link href="/servicios/medicos">
                  <span className="text-neutral-500 hover:text-primary cursor-pointer">Servicios Médicos</span>
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-neutral-400">/</span>
                <span className="text-neutral-800 font-medium">Especialidades</span>
              </li>
            </ul>
          </div>
          
          {/* Cabecera */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-800 font-serif">Nuestras Especialidades Médicas</h1>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              En Centro Médico Clodina contamos con un equipo de especialistas altamente cualificados para ofrecerle la mejor atención médica en diversas áreas de la salud.
            </p>
          </div>
          
          {/* Lista de especialidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {CONSULTATIONS.map((specialty, index) => (
              <motion.div
                key={specialty.id}
                className="bg-white rounded-lg shadow-md overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="p-8 flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <i className={`${specialty.icon} text-2xl text-primary`}></i>
                  </div>
                  <h2 className="text-xl font-bold mb-4 text-neutral-800">{specialty.title}</h2>
                  
                  <ul className="mt-4 space-y-2 text-left mb-6">
                    {specialty.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                        <span className="text-neutral-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-auto">
                    <a href="/citas" className="inline-block">
                      <Button className="bg-primary hover:bg-primary-dark w-full">
                        Solicitar Cita
                      </Button>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Información adicional */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4 font-serif">Nuestro Compromiso con su Salud</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                En Centro Médico Clodina nos comprometemos a ofrecer una atención médica personalizada y de calidad, adaptada a las necesidades específicas de cada paciente.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user-md text-2xl text-primary"></i>
                </div>
                <h3 className="text-lg font-bold mb-2 text-neutral-800">Profesionales Cualificados</h3>
                <p className="text-neutral-600">
                  Nuestro equipo médico está formado por profesionales con amplia experiencia y formación continua.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-stethoscope text-2xl text-primary"></i>
                </div>
                <h3 className="text-lg font-bold mb-2 text-neutral-800">Tecnología Avanzada</h3>
                <p className="text-neutral-600">
                  Contamos con equipamiento médico de última generación para garantizar diagnósticos precisos.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-heartbeat text-2xl text-primary"></i>
                </div>
                <h3 className="text-lg font-bold mb-2 text-neutral-800">Atención Personalizada</h3>
                <p className="text-neutral-600">
                  Ofrecemos un trato cercano y humano, adaptando nuestros servicios a las necesidades de cada paciente.
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="bg-primary/5 rounded-lg p-8 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2 font-serif">¿Necesita una consulta especializada?</h2>
              <p className="text-neutral-600 max-w-2xl">
                No dude en contactarnos para solicitar información sobre nuestras especialidades o para concertar una cita con nuestros especialistas.
              </p>
            </div>
            <a href="/citas" className="inline-block">
              <Button className="mt-4 md:mt-0 bg-primary hover:bg-primary-dark">
                Solicitar Cita
              </Button>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}