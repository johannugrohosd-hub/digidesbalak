import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  items: { label: string; page?: string }[];
  onNavigate: (page: string) => void;
  actions?: React.ReactNode;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 no-print">
      <nav className="flex items-center space-x-1.5 text-xs text-slate-500">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-1 hover:text-emerald-700 font-medium transition"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Beranda</span>
        </button>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              {item.page && !isLast ? (
                <button
                  onClick={() => onNavigate(item.page!)}
                  className="hover:text-emerald-700 font-medium transition"
                >
                  {item.label}
                </button>
              ) : (
                <span className={isLast ? 'font-bold text-slate-800' : 'text-slate-600'}>
                  {item.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
