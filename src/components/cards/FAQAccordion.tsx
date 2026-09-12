import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQItem } from '../../types/clinic';

interface FAQAccordionProps {
  items: FAQItem[];
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ items }) => {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? 'bg-white border-brand-300 shadow-md ring-1 ring-brand-100'
                : 'bg-white/80 border-slate-200/80 hover:border-slate-300 shadow-xs'
            }`}
          >
            <button
              id={`faq-question-${item.id}`}
              type="button"
              onClick={() => toggleItem(item.id)}
              className="w-full p-6 text-left flex items-center justify-between space-x-4 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset"
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${item.id}`}
            >
              <div className="flex items-center space-x-3.5">
                <HelpCircle size={20} className={isOpen ? 'text-brand-600' : 'text-slate-400'} />
                <span className="font-serif font-bold text-navy-900 text-base md:text-lg">
                  {item.question}
                </span>
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${
                  isOpen ? 'bg-brand-50 text-brand-600 rotate-180' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <ChevronDown size={18} />
              </div>
            </button>

            {isOpen && (
              <div
                id={`faq-panel-${item.id}`}
                role="region"
                aria-labelledby={`faq-question-${item.id}`} className="px-6 pb-6 pt-0 text-navy-600 text-sm md:text-base leading-relaxed border-t border-slate-100/60 mt-1">
                <p className="pt-4">{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
