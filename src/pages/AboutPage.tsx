import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, MessageCircle, Phone } from 'lucide-react';
import { BUSINESS_INFO, buildWhatsAppUrl } from '../lib/constants';
import { SEOHead, buildOrganizationSchema } from '../components/SEOHead';
import { SmartImage } from '../components/SmartImage';

const CORE_VALUES = [
  {
    number: '01',
    title: 'Clear Title & Legal Due Diligence',
    description:
      'Every residential plot, villa, apartment, and commercial showroom undergoes thorough ownership chain verification, mutation checks, and local authority review.',
  },
  {
    number: '02',
    title: 'Direct Owner Accountability',
    description:
      'Clients consult directly with Jitendra Goyal and Hemant Goyal from initial property shortlisting through final sub-registrar execution.',
  },
  {
    number: '03',
    title: 'Hyper-Local Mathura Expertise',
    description:
      'Positioned at Mandi Choraha near Shree Ram Sonk Road, our advisory covers Sonk Road, NH-19, Goverdhan Road, Dampier Nagar, and the Vrindavan residential corridor.',
  },
];

export function AboutPage() {
  return (
    <>
      <SEOHead
        title="About Jitendra Goyal & Hemant Goyal | Shri Goyal Associate Mathura"
        description="Meet Jitendra Goyal and Hemant Goyal, owners of Shri Goyal Associate—premier real estate consultants and property dealers at Mandi Choraha, Mathura, Uttar Pradesh."
        canonicalPath="/about"
        jsonLd={[
          buildOrganizationSchema(),
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'About Shri Goyal Associate',
            url: 'https://www.shrigoyalassociate.in/about',
          },
        ]}
      />

      {/* HEADER */}
      <section className="bg-white border-b border-stone-200/80 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-stone-500 mb-3">
            <Link to="/" className="hover:text-[#9a7b3e]">
              Home
            </Link>{' '}
            <span aria-hidden="true">/</span>{' '}
            <span className="text-stone-800">About Us</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <p className="text-xs font-medium text-[#9a7b3e]">
                Real Estate Consultants · Mathura, Uttar Pradesh
              </p>
              {/* SINGLE H1 ON ABOUT PAGE */}
              <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#18181b]">
                Principled Property Advisory Led by Jitendra Goyal &amp; Hemant Goyal
              </h1>
              <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
                <strong>Shri Goyal Associate</strong> is a premier real estate dealership and property consultancy based at Mandi Choraha, Near Shree Ram Sonk Road, Mathura. We help families, NRI buyers, businesses, and land investors acquire high-conviction real estate across Mathura and Vrindavan.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/properties"
                  className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-lg bg-[#18181b] text-white text-sm font-medium hover:bg-[#9a7b3e] transition-colors"
                >
                  Explore Verified Properties
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center min-h-[44px] px-6 py-2.5 rounded-lg border border-stone-300 text-sm font-medium text-[#18181b] hover:border-[#9a7b3e] transition-colors"
                >
                  Visit Mathura Office
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-stone-200 bg-[#faf9f6]">
                <SmartImage
                  src={BUSINESS_INFO.officeImage}
                  alt={BUSINESS_INFO.officeImageAlt}
                  width={900}
                  height={675}
                  priority
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="p-4 text-xs text-stone-600 flex items-center gap-2 border-t border-stone-200/70">
                  <MapPin className="h-4 w-4 text-[#9a7b3e] shrink-0" aria-hidden="true" />
                  <span>
                    Shri Goyal Associate Office — Mandi Choraha, Near Shree Ram Sonk Road, Mathura – 281004
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP SECTION */}
      <section className="py-20 bg-[#faf9f6] border-b border-stone-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 space-y-2">
            <p className="text-xs font-medium text-[#9a7b3e]">Ownership &amp; Leadership</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#18181b]">
              Meet Our Owners
            </h2>
            <p className="text-sm sm:text-base text-stone-600">
              Hands-on guidance backed by deep relationships across Mathura’s residential, commercial, and agricultural real estate landscape.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {BUSINESS_INFO.owners.map((owner) => (
              <article
                key={owner.name}
                className="rounded-2xl border border-stone-200 bg-white overflow-hidden grid grid-cols-1 sm:grid-cols-12"
              >
                <div className="sm:col-span-5 bg-stone-100">
                  <SmartImage
                    src={owner.image}
                    alt={owner.alt}
                    width={480}
                    height={600}
                    className="h-72 sm:h-full w-full object-cover object-top"
                  />
                </div>
                <div className="sm:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[#9a7b3e]">{owner.role}</p>
                    <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#18181b]">
                      {owner.name}
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed">{owner.bio}</p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center gap-3 text-xs font-medium">
                    <a
                      href={`tel:+91${BUSINESS_INFO.primaryPhone}`}
                      className="inline-flex items-center gap-1.5 text-[#18181b] hover:text-[#9a7b3e] tabular-nums"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#9a7b3e]" aria-hidden="true" />
                      +91 {BUSINESS_INFO.primaryPhone}
                    </a>
                    <span className="text-stone-300" aria-hidden="true">·</span>
                    <a
                      href={buildWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#15803d] hover:underline"
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      WhatsApp Direct
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-medium text-[#9a7b3e]">Advisory Standards</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#18181b]">
              How We Protect Every Property Transaction
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CORE_VALUES.map((val) => (
              <div
                key={val.number}
                className="rounded-xl border border-stone-200/90 bg-[#faf9f6] p-7 space-y-3"
              >
                <span className="font-mono text-xs text-[#9a7b3e] tabular-nums">
                  {val.number}
                </span>
                <h3 className="font-display text-2xl font-semibold text-[#18181b]">
                  {val.title}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {val.description}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-stone-200 bg-[#18181b] text-white p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white">
                Explore Our Advisory Services or Schedule a Visit
              </h2>
              <p className="text-sm text-stone-300">
                Learn how Shri Goyal Associate handles buying, selling, leasing, and registry support across Mathura.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/services"
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg bg-[#9a7b3e] text-white text-sm font-medium hover:bg-[#7f632e]"
              >
                Our Services
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg border border-stone-600 text-white text-sm font-medium hover:bg-stone-800"
              >
                Contact Office
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
