import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, MessageCircle, Phone } from 'lucide-react';
import { BUSINESS_INFO, buildWhatsAppUrl } from '../lib/constants';
import { SEOHead } from '../components/SEOHead';
import { InquiryForm } from '../components/InquiryForm';

const DETAILED_SERVICES = [
  {
    index: '01',
    title: 'Residential Buying & Selling Advisory',
    summary:
      'End-to-end representation for luxury villas, independent houses, builder floors, and 2–4 BHK apartments in Mathura and Vrindavan.',
    deliverables: [
      'Shortlisting verified freehold & MVDA-approved homes matching family requirements',
      'On-ground accompanied site inspections across Sonk Road, Dampier Nagar & Vrindavan',
      'Transparent price discovery benchmarked against recent registered transactions',
      'Bank home-loan documentation coordination with leading nationalized & private banks',
    ],
    ctaLabel: 'Browse Residential Listings',
    ctaLink: '/properties?propertyType=Villa',
  },
  {
    index: '02',
    title: 'Residential & Township Plot Acquisition',
    summary:
      'Strategic land and gated colony plot investments designed for both custom home construction and long-term capital appreciation.',
    deliverables: [
      'Verification of 143/non-agricultural conversion and MVDA layout approvals',
      'Corner and park-facing residential plot selection on 30-ft to 60-ft wide roads',
      'Physical demarcation, measurement verification, and encumbrance checks',
      'Guidance on highway corridor appreciation near Sonk Road & NH-19 Bypass',
    ],
    ctaLabel: 'Explore Residential Plots',
    ctaLink: '/properties?propertyType=Plot',
  },
  {
    index: '03',
    title: 'Commercial Showrooms, Shops & Corporate Leasing',
    summary:
      'High-visibility retail storefronts, commercial buildings, offices, and commercial land mandates across Mathura’s primary business arteries.',
    deliverables: [
      'Main-road commercial showrooms and retail shops near Mandi Choraha',
      'Long-term corporate lease structuring for banks, clinics, and retail chains',
      'Rental yield modeling and commercial title due diligence',
      'Tenant screening and registered lease deed execution',
    ],
    ctaLabel: 'View Commercial Properties',
    ctaLink: '/properties?propertyType=Commercial',
  },
  {
    index: '04',
    title: 'Valuation, Title Verification & Registry Assistance',
    summary:
      'Complete transaction closure support ensuring peace of mind from token agreement to final sub-registrar deed handover.',
    deliverables: [
      '30-year chain-of-title scrutiny and Khatauni / municipal mutation checks',
      'Accurate circle-rate calculation and stamp-duty estimation',
      'Drafting of Agreement to Sell, Sale Deed, and Rent Agreements',
      'Dedicated coordination during Sub-Registrar appointment in Mathura',
    ],
    ctaLabel: 'Speak With Our Advisors',
    ctaLink: '/contact',
  },
];

export function ServicesPage() {
  return (
    <>
      <SEOHead
        title="Real Estate & Property Consultancy Services in Mathura | Shri Goyal Associate"
        description="Explore property buying, selling, renting, MVDA plot investment, commercial leasing, and registry services in Mathura by Jitendra Goyal & Hemant Goyal."
        canonicalPath="/services"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'Real Estate Consultancy & Property Brokerage',
          provider: {
            '@type': 'RealEstateAgent',
            name: BUSINESS_INFO.companyName,
            telephone: '+91-9720241212',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Mandi Choraha, Near Shree Ram Sonk Road',
              addressLocality: 'Mathura',
              addressRegion: 'Uttar Pradesh',
              postalCode: '281004',
              addressCountry: 'IN',
            },
          },
          areaServed: 'Mathura, Uttar Pradesh',
        }}
      />

      <section className="bg-white border-b border-stone-200/80 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-stone-500 mb-3">
            <Link to="/" className="hover:text-[#9a7b3e]">
              Home
            </Link>{' '}
            <span aria-hidden="true">/</span>{' '}
            <span className="text-stone-800">Services</span>
          </nav>

          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-medium text-[#9a7b3e]">
              Property Dealer &amp; Real Estate Consultant · Mathura
            </p>
            {/* SINGLE H1 ON SERVICES PAGE */}
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#18181b]">
              Full-Spectrum Real Estate Advisory Services
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              From shortlisting freehold villas and gated residential plots to negotiating commercial leases and executing clean property registries, Shri Goyal Associate delivers disciplined representation at every stage.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-[#faf9f6] border-b border-stone-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="font-display text-3xl font-semibold text-[#18181b]">
            Core Practice Areas
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {DETAILED_SERVICES.map((srv) => (
              <article
                key={srv.index}
                className="rounded-2xl border border-stone-200/90 bg-white p-7 sm:p-8 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <span className="font-mono text-xs font-medium text-[#9a7b3e] tabular-nums">
                    {srv.index}. Advisory Service
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#18181b]">
                    {srv.title}
                  </h3>
                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                    {srv.summary}
                  </p>

                  <ul className="space-y-2.5 pt-2 text-sm text-stone-700">
                    {srv.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2.5">
                        <Check
                          className="h-4 w-4 text-[#9a7b3e] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <Link
                    to={srv.ctaLink}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#18181b] hover:text-[#9a7b3e] transition-colors"
                  >
                    {srv.ctaLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-medium text-[#9a7b3e]">Book a Consultation</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#18181b]">
              Discuss Your Property Requirement With Jitendra &amp; Hemant Goyal
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Looking to list your property for sale or rent, or searching for a verified plot, house, or commercial showroom in Mathura? Reach out directly below.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`tel:+91${BUSINESS_INFO.primaryPhone}`}
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#18181b] text-white text-sm font-medium hover:bg-[#9a7b3e] tabular-nums"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call {BUSINESS_INFO.primaryPhone}
              </a>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#15803d] text-white text-sm font-medium hover:bg-[#166534]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp Us
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-[#faf9f6] p-6 sm:p-8">
            <h3 className="font-display text-2xl font-semibold text-[#18181b] mb-4">
              Request Advisory Callback
            </h3>
            <InquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
