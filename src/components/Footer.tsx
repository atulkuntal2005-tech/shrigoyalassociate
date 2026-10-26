import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { BUSINESS_INFO, buildWhatsAppUrl } from '../lib/constants';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#18181b] text-stone-300 border-t border-stone-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand & Leadership */}
          <div className="space-y-4">
            <Link
              to="/"
              className="font-display text-2xl font-semibold text-white tracking-tight inline-block"
            >
              {BUSINESS_INFO.companyName}
            </Link>
            <p className="text-sm leading-relaxed text-stone-400">
              Trusted real estate consultants and property advisors in Mathura and Vrindavan, led by{' '}
              <strong className="text-stone-200 font-medium">Jitendra Goyal</strong> and{' '}
              <strong className="text-stone-200 font-medium">Hemant Goyal</strong>.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <a
                href={`tel:+91${BUSINESS_INFO.primaryPhone}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-stone-800 text-stone-100 text-xs font-medium hover:bg-[#9a7b3e] hover:text-white transition-colors whitespace-nowrap"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                Call {BUSINESS_INFO.primaryPhone}
              </a>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#15803d] text-white text-xs font-medium hover:bg-[#166534] transition-colors whitespace-nowrap"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Column 2: Quick Internal Links */}
          <div>
            <h2 className="font-display text-lg font-semibold text-white mb-4">
              Navigation
            </h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-[#d4b475] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-[#d4b475] transition-colors">
                  All Properties
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#d4b475] transition-colors">
                  About Jitendra &amp; Hemant Goyal
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#d4b475] transition-colors">
                  Real Estate Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#d4b475] transition-colors">
                  Contact &amp; Office Location
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Property Categories (Contextual Internal Links) */}
          <div>
            <h2 className="font-display text-lg font-semibold text-white mb-4">
              Property Portfolio
            </h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/properties?propertyType=Villa"
                  className="hover:text-[#d4b475] transition-colors"
                >
                  Luxury Villas in Mathura &amp; Vrindavan
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?propertyType=Apartment"
                  className="hover:text-[#d4b475] transition-colors"
                >
                  Residential Apartments &amp; Flats
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?propertyType=Plot"
                  className="hover:text-[#d4b475] transition-colors"
                >
                  MVDA Approved Residential Plots
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?propertyType=Commercial"
                  className="hover:text-[#d4b475] transition-colors"
                >
                  Commercial Showrooms &amp; Shops
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?listingType=Rent"
                  className="hover:text-[#d4b475] transition-colors"
                >
                  Commercial &amp; Residential Rentals
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Verified Office Contact (Zero Invented Hours) */}
          <div>
            <h2 className="font-display text-lg font-semibold text-white mb-4">
              Mathura Office
            </h2>
            <address className="not-italic space-y-3 text-sm text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#d4b475] shrink-0 mt-1" aria-hidden="true" />
                <span>
                  Mandi Choraha,
                  <br />
                  Near Shree Ram Sonk Road,
                  <br />
                  Mathura, Uttar Pradesh – 281004
                </span>
              </div>
              <div className="flex items-center gap-2.5 tabular-nums">
                <Phone className="h-4 w-4 text-[#d4b475] shrink-0" aria-hidden="true" />
                <div className="flex flex-wrap gap-x-2">
                  <a
                    href="tel:+919720241212"
                    className="hover:text-white transition-colors"
                  >
                    +91 97202 41212
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href="tel:+919012792020"
                    className="hover:text-white transition-colors"
                  >
                    +91 90127 92020
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#d4b475] shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="hover:text-white transition-colors break-all"
                >
                  {BUSINESS_INFO.email}
                </a>
              </div>
            </address>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            © {year} {BUSINESS_INFO.companyName}. Owners: Jitendra Goyal &amp; Hemant Goyal. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-300 transition-colors"
            >
              Sitemap (.in)
            </a>
            <Link to="/admin" className="hover:text-stone-300 transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
