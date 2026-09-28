import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PageHeader = ({ title, description, actions, breadcrumbs = [] }) => {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center text-sm text-slate-500 mb-2">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
                {crumb.path ? (
                  <Link to={crumb.path} className="hover:text-primary-600 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-800 font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};
