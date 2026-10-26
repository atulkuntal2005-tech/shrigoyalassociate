import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Expand,
  MapPin,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react';
import { fetchPublicPropertyBySlug } from '../lib/api';
import { BUSINESS_INFO, buildWhatsAppUrl } from '../lib/constants';
import { formatFullINR, formatINR } from '../lib/utils';
import type { PropertyRecord } from '../types';
import { SEOHead } from '../components/SEOHead';
import { SmartImage } from '../components/SmartImage';
import { InquiryForm } from '../components/InquiryForm';
import { PropertyCard } from '../components/PropertyCard';
import { Skeleton } from '../components/ui/skeleton';

export function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [property, setProperty] = useState<PropertyRecord | null>(null);
  const [related, setRelated] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Gallery & Lightbox state
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    setNotFound(false);
    setActiveIndex(0);

    fetchPublicPropertyBySlug(slug)
      .then((res) => {
        if (!active) return;
        setProperty(res.property);
        setRelated(res.relatedProperties);
      })
      .catch(() => {
        if (!active) return;
        setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const images =
    property?.images && property.images.length > 0
      ? property.images
      : property?.coverImage
      ? [
          {
            id: 'cover-fallback',
            propertyId: property.id,
            storagePath: '',
            publicUrl: property.coverImage,
            caption: property.title,
            altText: `${property.title} in ${property.location}`,
            sortOrder: 0,
            isCover: true,
            createdAt: property.createdAt,
          },
        ]
      : [];

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, handleNext, handlePrev]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-36 w-full" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center space-y-5">
        <SEOHead
          title="Property Not Found | Shri Goyal Associate"
          description="The requested property listing could not be found."
          noIndex
        />
        <h1 className="font-display text-4xl font-semibold text-[#18181b]">
          Property Listing Not Found
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          This property may have been sold, leased, or moved. Explore other verified properties in Mathura below.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-lg bg-[#18181b] text-white text-sm font-medium hover:bg-[#9a7b3e]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to All Properties
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = images[activeIndex] || images[0];
  const propertySchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: property.title,
      description: property.description,
      url: `${BUSINESS_INFO.domain}/properties/${property.slug}`,
      datePosted: property.createdAt,
      image: images.map((img) =>
        img.publicUrl.startsWith('http')
          ? img.publicUrl
          : `${BUSINESS_INFO.domain}${img.publicUrl}`
      ),
      offers: {
        '@type': 'Offer',
        price: property.price,
        priceCurrency: 'INR',
        availability:
          property.status === 'Available'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/SoldOut',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${BUSINESS_INFO.domain}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Properties',
          item: `${BUSINESS_INFO.domain}/properties`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: property.title,
          item: `${BUSINESS_INFO.domain}/properties/${property.slug}`,
        },
      ],
    },
  ];

  return (
    <>
      <SEOHead
        title={`${property.title} – ${property.location} | Shri Goyal Associate`}
        description={`${property.propertyType} for ${property.listingType} in ${property.location} (${property.area.toLocaleString('en-IN')} sq.ft) at ${formatINR(property.price, property.listingType)}. Verified by Shri Goyal Associate Mathura.`}
        canonicalPath={`/properties/${property.slug}`}
        ogImage={currentImage?.publicUrl}
        ogType="article"
        jsonLd={propertySchema}
      />

      <div className="bg-[#faf9f6] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Breadcrumb & Back Link */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 flex-wrap">
              <Link to="/" className="hover:text-[#9a7b3e]">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link to="/properties" className="hover:text-[#9a7b3e]">
                Properties
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-stone-800 truncate max-w-[260px]">
                {property.title}
              </span>
            </nav>

            <Link
              to="/properties"
              className="inline-flex items-center gap-1.5 font-medium text-stone-700 hover:text-[#9a7b3e]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to Listings
            </Link>
          </div>

          {/* IMAGE GALLERY WITH COVER + THUMBNAILS + LIGHTBOX */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 aspect-[16/9] max-h-[560px] w-full">
              <SmartImage
                src={currentImage?.publicUrl}
                alt={
                  currentImage?.altText ||
                  `${property.title} – ${property.location} | Shri Goyal Associate`
                }
                width={1400}
                height={788}
                priority
                className="h-full w-full object-cover"
              />

              {images.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-black/75 px-4 py-2 text-xs font-medium text-white hover:bg-black transition-colors cursor-pointer"
                >
                  <Expand className="h-3.5 w-3.5" aria-hidden="true" />
                  Open Lightbox ({activeIndex + 1} / {images.length})
                </button>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous property photo"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-[#18181b] flex items-center justify-center shadow hover:bg-white cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next property photo"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-[#18181b] flex items-center justify-center shadow hover:bg-white cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {currentImage?.caption && (
              <p className="text-xs text-stone-500">{currentImage.caption}</p>
            )}

            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`View photo ${idx + 1}`}
                    className={`relative h-20 w-28 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activeIndex
                        ? 'border-[#9a7b3e]'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <SmartImage
                      src={img.publicUrl}
                      alt={img.altText || `${property.title} view ${idx + 1}`}
                      width={224}
                      height={160}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MAIN CONTENT + STICKY INQUIRY SIDEBAR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 space-y-10">
              {/* Header & Key Metrics */}
              <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center gap-x-2 text-xs font-medium text-stone-500">
                  <span className="text-[#9a7b3e]">{property.propertyType}</span>
                  <span aria-hidden="true">·</span>
                  <span>For {property.listingType}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      property.status === 'Available'
                        ? 'text-emerald-800'
                        : property.status === 'Sold'
                        ? 'text-red-700'
                        : 'text-amber-800'
                    }
                  >
                    {property.status}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    {/* SINGLE H1 ON PROPERTY DETAIL PAGE */}
                    <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#18181b]">
                      {property.title}
                    </h1>
                    <p className="flex items-center gap-1.5 text-sm sm:text-base text-stone-600">
                      <MapPin
                        className="h-4 w-4 text-[#9a7b3e] shrink-0"
                        aria-hidden="true"
                      />
                      <span>{property.location}</span>
                    </p>
                  </div>

                  <div className="md:text-right shrink-0">
                    <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#18181b] tabular-nums">
                      {formatINR(property.price, property.listingType)}
                    </p>
                    <p className="font-mono text-xs text-stone-500 tabular-nums mt-0.5">
                      {formatFullINR(property.price)}
                    </p>
                  </div>
                </div>

                {/* Structured Key Specs Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-stone-100 tabular-nums">
                  <div>
                    <p className="text-xs text-stone-500">Property Type</p>
                    <p className="text-sm font-semibold text-[#18181b] mt-0.5">
                      {property.propertyType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Total Area</p>
                    <p className="text-sm font-semibold text-[#18181b] mt-0.5">
                      {property.area.toLocaleString('en-IN')} sq.ft
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Bedrooms</p>
                    <p className="text-sm font-semibold text-[#18181b] mt-0.5">
                      {property.bedrooms > 0 ? `${property.bedrooms} BHK / Beds` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Bathrooms</p>
                    <p className="text-sm font-semibold text-[#18181b] mt-0.5">
                      {property.bathrooms > 0 ? property.bathrooms : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Description */}
              <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[#18181b]">
                  Property Overview
                </h2>
                <div className="text-sm sm:text-base text-stone-600 leading-relaxed whitespace-pre-line">
                  {property.description}
                </div>
              </div>

              {/* Features & Highlights */}
              {property.features.length > 0 && (
                <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 space-y-5">
                  <h2 className="font-display text-2xl font-semibold text-[#18181b]">
                    Key Highlights &amp; Features
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm text-stone-700">
                    {property.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check
                          className="h-4 w-4 text-[#9a7b3e] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 space-y-5">
                  <h2 className="font-display text-2xl font-semibold text-[#18181b]">
                    Amenities &amp; Infrastructure
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm text-stone-700">
                    {property.amenities.map((amenity) => (
                      <li key={amenity} className="flex items-start gap-2.5">
                        <Check
                          className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: DIRECT CONTACT + INQUIRY FORM */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-stone-200/90 bg-white p-6 space-y-5">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#9a7b3e]">
                    Shri Goyal Associate
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-[#18181b]">
                    Schedule a Site Visit
                  </h2>
                  <p className="text-xs text-stone-600">
                    Speak directly with Jitendra Goyal or Hemant Goyal regarding this property.
                  </p>
                </div>

                {/* Direct Call & Property-Specific WhatsApp Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  <a
                    href={`tel:+91${BUSINESS_INFO.primaryPhone}`}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg bg-[#18181b] text-white text-sm font-medium hover:bg-[#27272a] transition-colors tabular-nums"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    Call +91 {BUSINESS_INFO.primaryPhone}
                  </a>

                  <a
                    href={buildWhatsAppUrl(property.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg bg-[#15803d] text-white text-sm font-medium hover:bg-[#166534] transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    WhatsApp About This Property
                  </a>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <h3 className="font-display text-lg font-semibold text-[#18181b] mb-3">
                    Send Direct Inquiry
                  </h3>
                  <InquiryForm
                    preselectedPropertyId={property.id}
                    preselectedPropertyTitle={property.title}
                    compact
                  />
                </div>
              </div>
            </aside>
          </div>

          {/* RELATED PROPERTIES */}
          {related.length > 0 && (
            <section className="pt-10 border-t border-stone-200 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#18181b]">
                  Related Properties in Mathura
                </h2>
                <Link
                  to="/properties"
                  className="text-sm font-medium text-[#9a7b3e] hover:underline"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {related.map((rel) => (
                  <PropertyCard key={rel.id} property={rel} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* FULL-SCREEN LIGHTBOX MODAL */}
      {lightboxOpen && currentImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Property Image Lightbox"
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
        >
          <div className="w-full max-w-6xl flex items-center justify-between text-white mb-3">
            <span className="text-sm font-mono tabular-nums">
              {activeIndex + 1} / {images.length} — {property.title}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close lightbox"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative w-full max-w-5xl max-h-[78vh] flex items-center justify-center">
            <img
              src={currentImage.publicUrl}
              alt={currentImage.altText || property.title}
              referrerPolicy="no-referrer"
              className="max-h-[78vh] max-w-full object-contain rounded-lg"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous image"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next image"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {currentImage.caption && (
            <p className="mt-3 text-sm text-stone-300 text-center max-w-2xl">
              {currentImage.caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}
