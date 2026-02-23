import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {items.map((item, index) => (
          <li key={item.href} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-neutral-400 mx-1" />
            )}
            
            {index === items.length - 1 ? (
              <span className="text-sm text-neutral-500">
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href}
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}