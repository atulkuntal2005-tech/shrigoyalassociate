import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
} from 'lucide-react';
import { BUSINESS_INFO, buildWhatsAppUrl } from '../lib/constants';
import { fetchPublicProperties } from '../lib/api';
import { PROPERTY_TYPES, LISTING_TYPES, type PropertyRecord } from '../types';
import { SEOHead, buildOrganizationSchema } from '../components/SEOHead';
import { SmartImage } from '../components/SmartImage';
import { PropertyCard } from '../components/PropertyCard';
import { InquiryForm } from '../components/InquiryForm';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const SERVICES_LIST = [
  {
    number: '01',
    title: 'Residential Villas, Houses & Apartments',
    description:
      'Curated freehold villas, independent houses, and 2–4 BHK apartments across Sonk Road, Dampier Nagar, and Vrindavan with verified MVDA approvals.',
    link: '/properties?propertyType=Villa',
    linkLabel: 'Browse Villas & Homes',
  },
  {
    number: '02',
    title: 'Commercial Showrooms, Offices & Retail',
    description:
      'High-visibility main-road retail shops, commercial complexes, and corporate office floors near Mandi Choraha and NH-19 for investors and growing enterprises.',
    link: '/properties?propertyType=Commercial',
    linkLabel: 'Explore Commercial Spaces',
  },
  {
    number: '03',
    title: 'Gated Residential Plots & Land Advisory',
    description:
      'Demarcated residential corner plots, township parcels, and strategic land holdings in Mathura with clear 30-year chain of title and bank loan eligibility.',
    link: '/properties?propertyType=Plot',
    linkLabel: 'View Available Plots',
  },
  {
    number: '04',
    title: 'Rental, Leasing & End-to-End Registration',
    description:
      'Complete tenant placement, commercial lease structuring, circle-rate valuation, stamp duty guidance, and seamless sub-registrar documentation.',
    link: '/services',
    linkLabel: 'View Advisory Process',
  },
];

const WHY_CHOOSE_ITEMS = [
  {
    title: 'Direct Owner-Led Consultancy',
    detail:
      'Every mandate is personally supervised by owners Jitendra Goyal and Hemant Goyal—ensuring honest pricing and direct negotiations between buyer and seller.',
  },
  {
    title: 'Rigorous Title & Registry Verification',
    detail:
      'We screen ownership records, mutation entries, encumbrance status, and MVDA layout approvals prior to presenting any property to our clients.',
  },
  {
    title: 'Rooted in Mathura & Braj Corridor',
    detail:
      'Headquartered at Mandi Choraha near Shree Ram Sonk Road, we bring on-ground intelligence across Mathura’s fastest-appreciating residential and commercial corridors.',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search form state
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('All');
  const [searchListing, setSearchListing] = useState('All');
  const [searchMaxPrice, setSearchMaxPrice] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPublicProperties({ featured: 'true' })
      .then((items) => {
        if (!active) return;
        setFeatured(items.slice(0, 6));
        setError(null);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message || 'Unable to load featured properties.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation.trim()) params.set('location', searchLocation.trim());
    if (searchType !== 'All') params.set('propertyType', searchType);
    if (searchListing !== 'All') params.set('listingType', searchListing);
    if (searchMaxPrice) params.set('maxPrice', searchMaxPrice);
    navigate(`/properties${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <>
      <SEOHead
        title="Shri Goyal Associate – Real Estate & Property Consultant in Mathura"
        description="Shri Goyal Associate, led by Jitendra Goyal and Hemant Goyal at Mandi Choraha, Mathura. Buy, sell, or rent verified villas, plots, flats, and commercial properties."
        canonicalPath="/"
        jsonLd={buildOrganizationSchema()}
      />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-[#faf9f6]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="lg:col-span-6 flex flex-col justify-center space-y-6"
            >
              <p className="text-xs font-medium tracking-wide text-[#9a7b3e]">
                Mathura &amp; Vrindavan · Led by Jitendra Goyal &amp; Hemant Goyal
              </p>

              {/* SINGLE H1 ON HOME PAGE */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-tight text-[#18181b] leading-[1.08]">
                Find the Right Property. Build the Right Future.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
                Shri Goyal Associate connects discerning families, investors, and businesses with verified residential villas, MVDA-approved plots, apartments, and prime commercial real estate in Mathura, Uttar Pradesh.
              </p>

              {/* Primary & Direct Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/properties"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3 rounded-lg text-sm font-medium bg-[#18181b] text-white hover:bg-[#9a7b3e] transition-colors whitespace-nowrap"
                >
                  Explore Properties
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 rounded-lg text-sm font-medium border border-stone-300 bg-white text-[#18181b] hover:border-[#9a7b3e] transition-colors whitespace-nowrap"
                >
                  Contact Us
                </Link>
              </div>

              {/* Call & WhatsApp Direct Action Strip */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-sm">
                <a
                  href={`tel:+91${BUSINESS_INFO.primaryPhone}`}
                  className="inline-flex items-center gap-2 font-medium text-stone-800 hover:text-[#9a7b3e] transition-colors tabular-nums"
                >
                  <Phone className="h-4 w-4 text-[#9a7b3e]" aria-hidden="true" />
                  Call +91 {BUSINESS_INFO.primaryPhone}
                </a>
                <span className="text-stone-300" aria-hidden="true">|</span>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-[#15803d] hover:text-[#166534] transition-colors"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp Consultation
                </a>
              </div>
            </motion.div>

            {/* Hero Architectural Visual */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-stone-200/80 min-h-[320px] sm:min-h-[420px]"
            >
              <SmartImage
                src={BUSINESS_INFO.heroImage}
                alt="Luxury architectural residence in Mathura Uttar Pradesh presented by Shri Goyal Associate"
                width={1280}
                height={720}
                priority
                className="h-full w-full lg:h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-6 text-white">
                <p className="text-xs text-stone-200">
                  Mandi Choraha · Near Shree Ram Sonk Road · Mathura – 281004
                </p>
                <p className="font-display text-xl font-medium mt-0.5">
                  Verified Residential, Commercial &amp; Plotted Estates
                </p>
              </div>
            </motion.div>
          </div>

          {/* PROPERTY SEARCH BAR (Full-width row below hero split) */}
          <div className="mt-10 rounded-xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
            <form
              onSubmit={handleSearchSubmit}
              aria-label="Search Properties"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="home-search-location"
                  className="block text-xs font-medium text-stone-600"
                >
                  Location or Keyword
                </label>
                <Input
                  id="home-search-location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Sonk Road, Mandi Choraha, Vrindavan..."
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="home-search-type"
                  className="block text-xs font-medium text-stone-600"
                >
                  Property Type
                </label>
                <select
                  id="home-search-type"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="flex min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-[#18181b] focus-visible:outline-none focus-visible:border-[#9a7b3e]"
                >
                  <option value="All">All Property Types</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="home-search-listing"
                  className="block text-xs font-medium text-stone-600"
                >
                  Listing Type
                </label>
                <select
                  id="home-search-listing"
                  value={searchListing}
                  onChange={(e) => setSearchListing(e.target.value)}
                  className="flex min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-[#18181b] focus-visible:outline-none focus-visible:border-[#9a7b3e]"
                >
                  <option value="All">Buy or Rent</option>
                  {LISTING_TYPES.map((lt) => (
                    <option key={lt} value={lt}>
                      For {lt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="home-search-budget"
                  className="block text-xs font-medium text-stone-600"
                >
                  Max Budget
                </label>
                <select
                  id="home-search-budget"
                  value={searchMaxPrice}
                  onChange={(e) => setSearchMaxPrice(e.target.value)}
                  className="flex min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-[#18181b] focus-visible:outline-none focus-visible:border-[#9a7b3e]"
                >
                  <option value="">Any Budget</option>
                  <option value="2500000">Up to ₹25 Lakh</option>
                  <option value="7500000">Up to ₹75 Lakh</option>
                  <option value="15000000">Up to ₹1.5 Crore</option>
                  <option value="30000000">Up to ₹3 Crore</option>
                  <option value="60000000">Up to ₹6 Crore</option>
                </select>
              </div>

              <Button type="submit" variant="gold" className="w-full">
                <Search className="h-4 w-4" aria-hidden="true" />
                Search Properties
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES SECTION */}
      <section className="py-20 bg-white border-b border-stone-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-medium text-[#9a7b3e]">Curated Mandates</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#18181b]">
                Featured Properties in Mathura &amp; Vrindavan
              </h2>
              <p className="text-sm sm:text-base text-stone-600">
                Handpicked residential villas, gated plots, apartments, and commercial showrooms vetted for clear title and long-term appreciation.
              </p>
            </div>
            <Link
              to="/properties"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#18181b] hover:text-[#9a7b3e] transition-colors whitespace-nowrap shrink-0"
            >
              View Entire Portfolio
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-xl border border-stone-200 bg-white overflow-hidden"
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-4/5" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="rounded-xl border border-stone-200 bg-[#faf9f6] p-12 text-center space-y-4">
              <h3 className="font-display text-2xl font-semibold text-[#18181b]">
                New Featured Mandates Arriving Soon
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Explore our full property catalog or contact Jitendra Goyal and Hemant Goyal directly for off-market plots and villas.
              </p>
              <Link
                to="/properties"
                className="inline-flex items-center justify-center min-h-[42px] px-5 py-2.5 rounded-lg bg-[#18181b] text-white text-sm font-medium hover:bg-[#9a7b3e] transition-colors"
              >
                Browse All Listings
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((prop, idx) => (
                <PropertyCard key={prop.id} property={prop} priority={idx < 2} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ABOUT SECTION (WITH REAL OWNER PORTRAITS & OFFICE PHOTO) */}
      <section className="py-20 bg-[#faf9f6] border-b border-stone-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <p className="text-xs font-medium text-[#9a7b3e]">About Shri Goyal Associate</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#18181b]">
                Trusted Real Estate Leadership in Mathura
              </h2>
              <p className="text-stone-600 leading-relaxed">
                Headquartered at <strong>Mandi Choraha, Near Shree Ram Sonk Road, Mathura</strong>, Shri Goyal Associate is an owner-operated real estate consultancy led by <strong>Jitendra Goyal</strong> and <strong>Hemant Goyal</strong>.
              </p>
              <p className="text-stone-600 leading-relaxed">
                Whether you are acquiring a family residence, investing in MVDA-approved plotted developments, or securing a commercial retail frontage, we guide every step with clear title verification and transparent valuation.
              </p>

              {/* Leadership Profiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {BUSINESS_INFO.owners.map((owner) => (
                  <div
                    key={owner.name}
                    className="rounded-xl border border-stone-200/90 bg-white p-4 flex items-center gap-4"
                  >
                    <SmartImage
                      src={owner.image}
                      alt={owner.alt}
                      width={160}
                      height={160}
                      className="h-16 w-16 rounded-full object-cover object-top shrink-0 border border-stone-200"
                    />
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-semibold text-[#18181b] truncate">
                        {owner.name}
                      </h3>
                      <p className="text-xs text-[#9a7b3e] font-medium">
                        {owner.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#18181b] hover:text-[#9a7b3e] transition-colors"
                >
                  Read Our Full Story &amp; Leadership Profile
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden border border-stone-200/90 bg-white">
                <SmartImage
                  src={BUSINESS_INFO.officeImage}
                  alt={BUSINESS_INFO.officeImageAlt}
                  width={960}
                  height={720}
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="p-5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold text-[#18181b]">
                      Shri Goyal Associate Office
                    </p>
                    <p className="text-xs text-stone-600">
                      Mandi Choraha, Near Shree Ram Sonk Road, Mathura – 281004
                    </p>
                  </div>
                  <Link
                    to="/contact"
                    className="text-xs font-medium text-[#9a7b3e] hover:underline whitespace-nowrap"
                  >
                    Get Directions →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION (Clean Human Editorial Numbering) */}
      <section className="py-20 bg-white border-b border-stone-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14 space-y-2">
            <p className="text-xs font-medium text-[#9a7b3e]">Advisory Capabilities</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#18181b]">
              Comprehensive Property Services
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Full-spectrum real estate brokerage and property consultation tailored to homebuyers, land investors, and commercial tenants across Mathura.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICES_LIST.map((service) => (
              <div
                key={service.number}
                className="rounded-xl border border-stone-200/90 bg-[#faf9f6] p-7 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <span className="font-mono text-xs font-medium text-[#9a7b3e] tabular-nums">
                    {service.number}. Service Mandate
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-[#18181b]">
                    {service.title}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div>
                  <Link
                    to={service.link}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#18181b] hover:text-[#9a7b3e] transition-colors"
                  >
                    {service.linkLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section className="py-20 bg-[#faf9f6] border-b border-stone-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 space-y-2">
            <p className="text-xs font-medium text-[#9a7b3e]">Why Clients Trust Us</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#18181b]">
              Built on Clear Titles &amp; Local Market Authority
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHY_CHOOSE_ITEMS.map((item, index) => (
              <div
                key={item.title}
                className="rounded-xl border border-stone-200/90 bg-white p-7 space-y-3"
              >
                <span className="font-mono text-xs text-[#9a7b3e] tabular-nums">
                  0{index + 1}
                </span>
                <h3 className="font-display text-2xl font-semibold text-[#18181b]">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LUXURY CTA BANNER */}
      <section className="py-16 bg-[#18181b] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-wide">
              Planning to Buy, Sell, or Lease Property in Mathura?
            </h2>
            <p className="text-stone-300 text-sm sm:text-base">
              Speak directly with Jitendra Goyal or Hemant Goyal for verified valuations, site visits, and off-market opportunities.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={`tel:+91${BUSINESS_INFO.primaryPhone}`}
              className="inline-flex items-center gap-2 min-h-[46px] px-6 py-2.5 rounded-lg bg-[#9a7b3e] text-white text-sm font-medium hover:bg-[#7f632e] transition-colors whitespace-nowrap tabular-nums"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call {BUSINESS_INFO.primaryPhone}
            </a>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[46px] px-6 py-2.5 rounded-lg bg-[#15803d] text-white text-sm font-medium hover:bg-[#166534] transition-colors whitespace-nowrap"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp Now
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION ON HOME PAGE */}
      <section id="contact-section" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-6">
              <p className="text-xs font-medium text-[#9a7b3e]">Direct Consultation</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#18181b]">
                Connect With Shri Goyal Associate
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Visit our office at Mandi Choraha or send us your property requirement below. Every inquiry is reviewed directly by our founders.
              </p>

              <div className="space-y-4 pt-2 text-sm text-stone-700">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#9a7b3e] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-[#18181b]">Office Address</p>
                    <p className="text-stone-600">
                      Mandi Choraha, Near Shree Ram Sonk Road,
                      <br />
                      Mathura, Uttar Pradesh – 281004
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-[#9a7b3e] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="tabular-nums">
                    <p className="font-medium text-[#18181b]">Direct Phone Numbers</p>
                    <p className="text-stone-600">
                      <a href="tel:+919720241212" className="hover:text-[#9a7b3e]">
                        +91 97202 41212
                      </a>{' '}
                      ·{' '}
                      <a href="tel:+919012792020" className="hover:text-[#9a7b3e]">
                        +91 90127 92020
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[#9a7b3e] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-[#18181b]">Email</p>
                    <a
                      href={`mailto:${BUSINESS_INFO.email}`}
                      className="text-stone-600 hover:text-[#9a7b3e]"
                    >
                      {BUSINESS_INFO.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-2xl border border-stone-200/90 bg-[#faf9f6] p-6 sm:p-8">
              <h3 className="font-display text-2xl font-semibold text-[#18181b] mb-2">
                Send a Property Inquiry
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                Fill in your details below and receive a prompt callback from Jitendra Goyal or Hemant Goyal.
              </p>
              <InquiryForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
