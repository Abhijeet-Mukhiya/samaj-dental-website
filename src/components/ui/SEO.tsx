import React, { useEffect } from 'react';
import { clinicConfig } from '../../config/clinic';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

function upsertMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

export const SEO: React.FC<SEOProps> = ({ title, description, image, noIndex = false }) => {
  useEffect(() => {
    const pageTitle = title
      ? `${title} | ${clinicConfig.name}`
      : clinicConfig.seo.defaultTitle;
    const pageDescription = description || clinicConfig.seo.defaultDescription;
    const configuredSiteUrl = clinicConfig.seo.siteUrl?.replace(/\/$/, '');
    const siteUrl = configuredSiteUrl || window.location.origin;
    const canonical = `${siteUrl}${window.location.pathname}`;

    document.title = pageTitle;
    upsertMeta('description', pageDescription);
    upsertMeta('robots', noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');

    const ogImage = image || clinicConfig.seo.ogImage;
    upsertMeta('og:title', pageTitle, 'property');
    upsertMeta('og:description', pageDescription, 'property');
    upsertMeta('og:type', 'website', 'property');
    upsertMeta('og:image', ogImage, 'property');
    if (canonical) {
      upsertMeta('og:url', canonical, 'property');
      upsertLink('canonical', canonical);
    }

    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', pageTitle);
    upsertMeta('twitter:description', pageDescription);
    upsertMeta('twitter:image', ogImage);

    // One site-wide JSON-LD block. Only verified clinic data is included.
    const schemaId = 'clinic-structured-data';
    let schema = document.getElementById(schemaId);
    if (!schema) {
      schema = document.createElement('script');
      schema.id = schemaId;
      schema.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schema);
    }

    const structuredData: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Dentist',
      name: clinicConfig.name,
      description: clinicConfig.seo.defaultDescription,
      ...(clinicConfig.phone ? { telephone: clinicConfig.phone } : {}),
      ...(clinicConfig.email ? { email: clinicConfig.email } : {}),
      ...(clinicConfig.address || clinicConfig.city || clinicConfig.country
        ? {
            address: {
              '@type': 'PostalAddress',
              ...(clinicConfig.city ? { addressLocality: clinicConfig.city } : {}),
              ...(clinicConfig.country ? { addressCountry: clinicConfig.country } : {}),
              ...(clinicConfig.address ? { streetAddress: clinicConfig.address } : {}),
              ...(clinicConfig.postalCode ? { postalCode: clinicConfig.postalCode } : {})
            }
          }
        : {}),
      ...(siteUrl ? { url: siteUrl } : {}),
      ...(clinicConfig.directionsUrl ? { hasMap: clinicConfig.directionsUrl } : {}),
      ...(Object.values(clinicConfig.social).filter(Boolean).length
        ? { sameAs: Object.values(clinicConfig.social).filter(Boolean) }
        : {})
    };

    schema.textContent = JSON.stringify(structuredData);
  }, [title, description, image, noIndex]);

  return null;
};
