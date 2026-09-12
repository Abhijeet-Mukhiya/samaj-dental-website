import React from 'react';
import * as Icons from 'lucide-react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

/**
 * Render dynamic Lucide icon by name with fallback
 */
export function getLucideIcon(iconName: string, props: IconProps = {}): React.ReactElement {
  const IconComponent = (Icons as unknown as Record<string, React.FC<IconProps>>)[iconName] || Icons.Sparkles;
  return React.createElement(IconComponent, { size: 24, ...props });
}

/**
 * Format currency amount for service pricing
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Scroll smoothly to top of page on route change
 */
export function scrollToTop(): void {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
