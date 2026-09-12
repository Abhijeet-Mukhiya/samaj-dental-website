import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, Calendar, Phone, Sparkles } from 'lucide-react';
import { clinicConfig } from '../../config/clinic';
import { getMainNavLinks, isSiteSectionEnabled } from '../../config/siteSections';
import { MobileMenu } from './MobileMenu';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = getMainNavLinks();

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-soft py-3 border-b border-slate-200/80'
            : 'bg-white py-4 border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 rounded-xl space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-medical-500 flex items-center justify-center text-white font-serif font-bold text-xl shadow-md group-hover:scale-105 transition-transform duration-300">
              {clinicConfig.logoText.charAt(0)}
            </div>
            <div>
              <span className="font-serif font-bold text-xl tracking-tight text-navy-900 block leading-none">
                {clinicConfig.logoText}{' '}
                <span className="text-brand-600 font-normal">{clinicConfig.logoSubtext}</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block mt-0.5">
                {clinicConfig.city} • Dental Care
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center space-x-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 font-semibold px-4 py-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-brand-700 shadow-sm font-bold'
                      : 'text-navy-700 hover:text-brand-600 hover:bg-white/60'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right CTA Area */}
          <div className="hidden lg:flex items-center space-x-3">
            {clinicConfig.phone && (
              <a
                href={`tel:${clinicConfig.phone}`}
                className="text-xs font-semibold text-navy-800 hover:text-brand-600 flex items-center space-x-1.5 px-3.5 py-2.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <Phone size={14} className="text-brand-500" aria-hidden="true" />
                <span>{clinicConfig.phone}</span>
              </a>
            )}

            {isSiteSectionEnabled('appointment') && <Link
              to="/appointment"
              className="bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-semibold text-xs uppercase tracking-wider px-5 py-3 rounded-full shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/40 transition-all flex items-center space-x-2 transform hover:-translate-y-0.5"
            >
              <Calendar size={15} />
              <span>Book Appointment</span>
            </Link>}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-2 lg:hidden">
            {isSiteSectionEnabled('appointment') && <Link
              to="/appointment"
              className="bg-brand-600 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1 shadow-sm"
            >
              <Calendar size={14} />
              <span>Book</span>
            </Link>}

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 rounded-xl text-navy-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};
