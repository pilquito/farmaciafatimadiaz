import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { ArrowLeft, ChevronRight } from 'lucide-react';

interface LegalDocumentProps {
  title: string;
  metaDescription: string;
  breadcrumbPath: string;
  breadcrumbLabel: string;
  content: string;
  isLoading?: boolean;
}

export function LegalDocument({ 
  title, 
  metaDescription, 
  breadcrumbPath, 
  breadcrumbLabel,
  content, 
  isLoading = false 
}: LegalDocumentProps) {
  return (
    <>
      <Helmet>
        <title>{title} | Farmacia Fátima Díaz Guillén</title>
        <meta name="description" content={metaDescription} />
      </Helmet>

      <div className="bg-neutral-50 py-6 border-b">
        <div className="container mx-auto px-4">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <Link 
                  href="/"
                  className="text-sm font-medium text-primary hover:text-primary-dark flex items-center"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-neutral-400 mx-1" />
                  <span className="text-sm text-neutral-500">
                    {breadcrumbLabel}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold text-neutral-800">{title}</h1>
          <p className="text-neutral-500 mt-2">Última actualización: Mayo 2025</p>
        </div>
      </div>

      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-200 rounded"></div>
              <div className="h-4 bg-neutral-200 rounded"></div>
              <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
              <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
            </div>
          ) : (
            <div 
              className="prose prose-green max-w-none text-neutral-700" 
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
          
          <div className="mt-10 pt-6 border-t border-neutral-200">
            <Link 
              href="/" 
              className="inline-flex items-center text-primary hover:text-primary-dark"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a inicio
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}