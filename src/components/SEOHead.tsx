import { useEffect } from 'react';
import { BUSINESS_INFO } from '../lib/constants';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

function setOrCreateMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function SEOHead({
  title,
  description,
  canonicalPath = '/',
  ogImage,
  ogType = 'website',
  noIndex = false,
  jsonLd,
}: SEOHeadProps) {
  useEffect(() => {
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${BUSINESS_INFO.domain}${cleanPath === '/' ? '/' : cleanPath.replace(/\/+$/, '')}`;
    const resolvedOgImage = ogImage
      ? ogImage.startsWith('http')
        ? ogImage
        : `${BUSINESS_INFO.domain}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`
      : BUSINESS_INFO.ogImage;

    document.title = title;
    setOrCreateMeta('name', 'description', description);
    setOrCreateMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

    setOrCreateMeta('property', 'og:title', title);
    setOrCreateMeta('property', 'og:description', description);
    setOrCreateMeta('property', 'og:type', ogType);
    setOrCreateMeta('property', 'og:url', canonicalUrl);
    setOrCreateMeta('property', 'og:image', resolvedOgImage);
    setOrCreateMeta('property', 'og:site_name', BUSINESS_INFO.companyName);
    setOrCreateMeta('property', 'og:locale', 'en_IN');

    setOrCreateMeta('name', 'twitter:card', 'summary_large_image');
    setOrCreateMeta('name', 'twitter:title', title);
    setOrCreateMeta('name', 'twitter:description', description);
    setOrCreateMeta('name', 'twitter:image', resolvedOgImage);

    let canonicalEl = document.head.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    const scriptId = 'dynamic-schema-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = scriptId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [title, description, canonicalPath, ogImage, ogType, noIndex, jsonLd]);

  return null;
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${BUSINESS_INFO.domain}/#organization`,
    name: BUSINESS_INFO.companyName,
    url: `${BUSINESS_INFO.domain}/`,
    image: BUSINESS_INFO.ogImage,
    logo: BUSINESS_INFO.ogImage,
    description:
      'Luxury real estate consultants and property dealers in Mathura & Vrindavan led by Jitendra Goyal and Hemant Goyal.',
    telephone: ['+91-9720241212', '+91-9012792020'],
    email: BUSINESS_INFO.email,
    founder: [
      {
        '@type': 'Person',
        name: 'Jitendra Goyal',
        jobTitle: 'Founder & Owner',
      },
      {
        '@type': 'Person',
        name: 'Hemant Goyal',
        jobTitle: 'Co-Owner & Senior Property Consultant',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Mandi Choraha, Near Shree Ram Sonk Road',
      addressLocality: 'Mathura',
      addressRegion: 'Uttar Pradesh',
      postalCode: '281004',
      addressCountry: 'IN',
    },
    areaServed: [
      { '@type': 'City', name: 'Mathura' },
      { '@type': 'City', name: 'Vrindavan' },
    ],
    priceRange: '₹₹₹',
  };
}
