import fs from 'node:fs';
import path from 'node:path';

const rawSiteUrl = process.argv[2] || process.env.SITE_URL || process.env.VITE_SITE_URL || '';
if (!rawSiteUrl) {
  console.warn('Skipped sitemap generation: set SITE_URL or VITE_SITE_URL for a production origin.');
  process.exit(0);
}
const siteUrl = rawSiteUrl.replace(/\/$/, '');

const sectionRoutes = {
  about: '/about',
  services: '/services',
  doctors: '/doctors',
  gallery: '/gallery',
  testimonials: '/testimonials',
  faq: '/faq',
  contact: '/contact',
  appointment: '/appointment',
  privacy: '/privacy',
  terms: '/terms'
};

const configSource = fs.readFileSync(path.resolve('src/config/clinic.ts'), 'utf8');
const sectionBlock = configSource.match(/siteSections\s*:\s*\{([\s\S]*?)\n\s*\},/);
const configuredSections = Object.keys(sectionRoutes).filter((section) => {
  const match = sectionBlock?.[1].match(new RegExp(`\\b${section}\\s*:\\s*(true|false)`));
  return match?.[1] === 'true';
});
const requestedSections = (process.env.VITE_ENABLED_SITE_SECTIONS || configuredSections.join(','))
  .split(',').map((value) => value.trim()).filter(Boolean);
const routes = ['/', ...requestedSections
  .filter((section) => configuredSections.includes(section))
  .filter((section) => sectionRoutes[section])
  .map((section) => sectionRoutes[section])];

const urls = routes.map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`).join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

fs.writeFileSync(path.resolve('public/sitemap.xml'), xml);
console.log(`Generated public/sitemap.xml for ${siteUrl}`);
