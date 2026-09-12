import React, { useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { X, Phone, MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import { clinicConfig } from '../../config/clinic';
import { getMainNavLinks, isSiteSectionEnabled } from '../../config/siteSections';

interface MobileMenuProps { isOpen: boolean; onClose: () => void; }

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navLinks = getMainNavLinks();

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
      <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={drawerRef} className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold font-serif text-lg" aria-hidden="true">
                {clinicConfig.logoText.charAt(0)}
              </div>
              <span id="mobile-menu-title" className="font-serif font-bold text-navy-900 text-lg">{clinicConfig.name}</span>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              aria-label="Close navigation menu"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile navigation" className="px-4 py-6 space-y-1">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} onClick={onClose}
                className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${isActive ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-navy-800 hover:bg-slate-50 hover:text-brand-600'}`}>
                <span>{link.name}</span><ChevronRight size={16} className="text-slate-400" aria-hidden="true" />
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
          {isSiteSectionEnabled('appointment') && <Link to="/appointment" onClick={onClose} className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-4 rounded-xl shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
            <Calendar size={18} aria-hidden="true" /><span>Book Appointment</span>
          </Link>}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {clinicConfig.phone && <a href={`tel:${clinicConfig.phone}`} className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-navy-800 text-sm font-medium py-2.5 px-3 rounded-lg hover:border-brand-500 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
              <Phone size={15} className="text-brand-500" aria-hidden="true" /><span>Call Us</span>
            </a>}
            {clinicConfig.whatsapp && <a href={`https://wa.me/${clinicConfig.whatsapp}?text=${encodeURIComponent(clinicConfig.whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
              <MessageSquare size={15} className="text-emerald-600" aria-hidden="true" /><span>WhatsApp</span>
            </a>}
          </div>
        </div>
      </div>
    </div>
  );
};
