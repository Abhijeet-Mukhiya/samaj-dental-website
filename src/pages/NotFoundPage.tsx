import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { isSiteSectionEnabled } from '../config/siteSections';

export const NotFoundPage: React.FC = () => {
  return (
    <>
      <SEO
        title="404 - Page Not Found"
        description="The requested page could not be found."
      />
      <main className="min-h-[70vh] flex items-center justify-center py-20 px-4 bg-slate-50/50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 text-center shadow-soft border border-slate-100 space-y-6">
          <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-600 font-serif font-bold text-4xl flex items-center justify-center mx-auto border-2 border-brand-200">
            404
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-navy-900 mb-2">Page Not Found</h1>
            <p className="text-navy-600 text-sm leading-relaxed">
              We couldn't find the page you were looking for. It may have been moved or renamed.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              to="/"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <Home size={16} />
              <span>Return to Homepage</span>
            </Link>
            {isSiteSectionEnabled('services') && <Link
              to="/services"
              className="w-full bg-slate-50 hover:bg-slate-100 text-navy-800 font-semibold py-3 px-4 rounded-xl border border-slate-200 transition-colors flex items-center justify-center space-x-2 text-xs"
            >
              <ArrowLeft size={14} />
              <span>Browse Dental Services</span>
            </Link>}
          </div>
        </div>
      </main>
    </>
  );
};
