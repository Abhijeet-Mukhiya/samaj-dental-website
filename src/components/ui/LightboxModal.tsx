import React, { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  imageSrc: string;
  title: string;
  caption?: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen, imageSrc, title, caption, onClose, onPrev, onNext,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocus.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && onPrev) onPrev();
      if (event.key === 'ArrowRight' && onNext) onNext();

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className="max-w-4xl w-full bg-navy-900 rounded-2xl overflow-hidden shadow-2xl border border-navy-800 flex flex-col max-h-[90vh]">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-3 rounded-full bg-navy-900/80 text-white hover:bg-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label="Close image viewer"
        >
          <X size={24} aria-hidden="true" />
        </button>

        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-navy-900/80 text-white hover:bg-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 hidden sm:block"
            aria-label="Previous image"
          >
            <ChevronLeft size={28} aria-hidden="true" />
          </button>
        )}

        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-navy-900/80 text-white hover:bg-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 hidden sm:block"
            aria-label="Next image"
          >
            <ChevronRight size={28} aria-hidden="true" />
          </button>
        )}

        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px]">
          <img src={imageSrc} alt={title} loading="eager" className="w-full h-full object-contain max-h-[70vh]" />
        </div>
        <div className="p-6 bg-navy-900 text-white">
          <h2 id="lightbox-title" className="font-serif font-bold text-xl mb-1">{title}</h2>
          {caption && <p className="text-slate-300 text-sm">{caption}</p>}
        </div>
      </div>
    </div>
  );
};
