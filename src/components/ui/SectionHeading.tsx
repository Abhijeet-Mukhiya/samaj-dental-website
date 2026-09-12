import React from 'react';
import { Badge } from './Badge';

interface SectionHeadingProps {
  badgeText?: string;
  title: string;
  subtitle?: string;
  alignment?: 'left' | 'center';
  darkTheme?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badgeText,
  title,
  subtitle,
  alignment = 'center',
  darkTheme = false,
}) => {
  const isCenter = alignment === 'center';

  return (
    <div className={`mb-12 md:mb-16 ${isCenter ? 'text-center max-w-3xl mx-auto' : 'max-w-2xl'}`}>
      {badgeText && (
        <div className={`mb-3 ${isCenter ? 'flex justify-center' : ''}`}>
          <Badge variant={darkTheme ? 'brand' : 'brand'}>{badgeText}</Badge>
        </div>
      )}
      <h2
        className={`font-serif font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight mb-4 ${
          darkTheme ? 'text-white' : 'text-navy-900'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-base sm:text-lg leading-relaxed ${
            darkTheme ? 'text-slate-300' : 'text-navy-600'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
