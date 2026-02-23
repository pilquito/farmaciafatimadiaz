import { motion } from "framer-motion";
import { Link } from "wouter";

interface Breadcrumb {
  label: string;
  href: string;
  active?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
}

export function PageHeader({ title, description, breadcrumbs }: PageHeaderProps) {
  return (
    <section className="bg-neutral-100 py-10 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-neutral-800">{title}</h1>
          {description && (
            <p className="text-neutral-600 max-w-2xl mx-auto mb-6">{description}</p>
          )}
          
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex justify-center">
              <ol className="flex flex-wrap items-center">
                {breadcrumbs.map((breadcrumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2 text-neutral-400">/</span>}
                    {breadcrumb.active ? (
                      <span className="text-primary font-medium">{breadcrumb.label}</span>
                    ) : (
                      <Link href={breadcrumb.href} className="text-neutral-600 hover:text-primary transition-colors duration-300">
                        {breadcrumb.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </motion.div>
      </div>
    </section>
  );
}