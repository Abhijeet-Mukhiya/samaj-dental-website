import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'navy' | 'emerald' | 'amber';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  className = '',
}) => {
  const variantStyles = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200/60',
    navy: 'bg-navy-900 text-slate-200 border-navy-700',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border shadow-xs ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
