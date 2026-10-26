import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Phone } from 'lucide-react';
import { BUSINESS_INFO } from '../lib/constants';
import { SEOHead } from '../components/SEOHead';

export function NotFoundPage() {
  return (
    <>
      <SEOHead
        title="404 – Page Not Found | Shri Goyal Associate"
        description="The page you requested could not be found on Shri Goyal Associate."
        noIndex
      />
      <section className="py-24 sm:py-32 bg-[#faf9f6]">
        <div className="mx-auto max-w-2xl px-4 text-center space-y-6">
          <p className="font-mono text-sm font-medium text-[#9a7b3e]">Error 404</p>
          {/* SINGLE H1 ON 404 PAGE */}
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#18181b]">
            The Page You Are Looking For Has Moved
          </h1>
          <p className="text-base text-stone-600 leading-relaxed">
            Explore our verified residential villas, plots, apartments, and commercial properties in Mathura, or return to the Shri Goyal Associate homepage.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-lg bg-[#18181b] text-white text-sm font-medium hover:bg-[#9a7b3e] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Return Home
            </Link>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-lg border border-stone-300 bg-white text-[#18181b] text-sm font-medium hover:border-[#9a7b3e] transition-colors"
            >
              <Building2 className="h-4 w-4 text-[#9a7b3e]" aria-hidden="true" />
              Browse Properties
            </Link>
            <a
              href={`tel:+91${BUSINESS_INFO.primaryPhone}`}
              className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-lg border border-stone-300 bg-white text-[#18181b] text-sm font-medium hover:border-[#9a7b3e] tabular-nums"
            >
              <Phone className="h-4 w-4 text-[#9a7b3e]" aria-hidden="true" />
              Call {BUSINESS_INFO.primaryPhone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
