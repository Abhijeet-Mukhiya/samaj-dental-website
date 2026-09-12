import { clinicConfig } from './clinic';

export type PublicSiteSection = keyof typeof clinicConfig.siteSections;

export const sectionRoutes: Record<PublicSiteSection, string> = {
  about: '/about',
  services: '/services',
  doctors: '/doctors',
  gallery: '/gallery',
  testimonials: '/testimonials',
  faq: '/faq',
  contact: '/contact',
  appointment: '/appointment',
  privacy: '/privacy',
  terms: '/terms',
};

export const sectionLabels: Record<PublicSiteSection, string> = {
  about: 'About',
  services: 'Services',
  doctors: 'Doctors',
  gallery: 'Gallery',
  testimonials: 'Testimonials',
  faq: 'FAQ',
  contact: 'Contact',
  appointment: 'Appointment',
  privacy: 'Privacy',
  terms: 'Terms',
};

export function isSiteSectionEnabled(section: PublicSiteSection): boolean {
  return clinicConfig.siteSections[section];
}

export function getMainNavLinks() {
  const sections: PublicSiteSection[] = [
    'about', 'services', 'doctors', 'gallery', 'testimonials', 'faq', 'contact',
  ];

  return [
    { name: 'Home', path: '/' },
    ...sections
      .filter(isSiteSectionEnabled)
      .map((section) => ({ name: sectionLabels[section], path: sectionRoutes[section] })),
  ];
}
