import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { BUSINESS_INFO, buildWhatsAppUrl } from '../lib/constants';
import { SEOHead, buildOrganizationSchema } from '../components/SEOHead';
import { InquiryForm } from '../components/InquiryForm';

export function ContactPage() {
  const mapQuery = encodeURIComponent(
    'Mandi Choraha, Sonk Road, Mathura, Uttar Pradesh 281004'
  );

  return (
    <>
      <SEOHead
        title="Contact Shri Goyal Associate – Mandi Choraha, Sonk Road, Mathura"
        description="Contact Jitendra Goyal and Hemant Goyal at Shri Goyal Associate, Mandi Choraha, Near Shree Ram Sonk Road, Mathura – 281004. Call 9720241212 or 9012792020."
        canonicalPath="/contact"
        jsonLd={[
          buildOrganizationSchema(),
          {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Contact Shri Goyal Associate Mathura',
            url: 'https://www.shrigoyalassociate.in/contact',
          },
        ]}
      />

      <section className="bg-white border-b border-stone-200/80 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-stone-500 mb-3">
            <Link to="/" className="hover:text-[#9a7b3e]">
              Home
            </Link>{' '}
            <span aria-hidden="true">/</span>{' '}
            <span className="text-stone-800">Contact</span>
          </nav>

          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-medium text-[#9a7b3e]">
              Mandi Choraha · Mathura, Uttar Pradesh – 281004
            </p>
            {/* SINGLE H1 ON CONTACT PAGE */}
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#18181b]">
              Contact Shri Goyal Associate
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              Reach out to Jitendra Goyal and Hemant Goyal by phone, WhatsApp, email, or visit our office near Shree Ram Sonk Road in Mathura.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-[#faf9f6] border-b border-stone-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Information & Direct Action Buttons (Zero Invented Business Hours) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-7 space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#18181b]">
                  {BUSINESS_INFO.companyName}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Owners: Jitendra Goyal &amp; Hemant Goyal
                </p>
              </div>

              <address className="not-italic space-y-5 text-sm text-stone-700">
                <div className="flex items-start gap-3">
                  <MapPin
                    className="h-5 w-5 text-[#9a7b3e] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold text-[#18181b]">Office Address</p>
                    <p className="text-stone-600 mt-0.5 leading-relaxed">
                      Mandi Choraha,
                      <br />
                      Near Shree Ram Sonk Road,
                      <br />
                      Mathura, Uttar Pradesh – 281004
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 tabular-nums">
                  <Phone
                    className="h-5 w-5 text-[#9a7b3e] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold text-[#18181b]">Phone Numbers</p>
                    <div className="mt-1 space-y-1">
                      <a
                        href="tel:+919720241212"
                        className="block text-stone-700 hover:text-[#9a7b3e] font-medium"
                      >
                        +91 97202 41212
                      </a>
                      <a
                        href="tel:+919012792020"
                        className="block text-stone-700 hover:text-[#9a7b3e] font-medium"
                      >
                        +91 90127 92020
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail
                    className="h-5 w-5 text-[#9a7b3e] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold text-[#18181b]">Email Address</p>
                    <a
                      href={`mailto:${BUSINESS_INFO.email}`}
                      className="text-stone-700 hover:text-[#9a7b3e] font-medium break-all"
                    >
                      {BUSINESS_INFO.email}
                    </a>
                  </div>
                </div>
              </address>

              {/* Action Buttons: Phone 1, Phone 2, Email, WhatsApp */}
              <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="tel:+919720241212"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg bg-[#18181b] text-white text-xs font-medium hover:bg-[#27272a] tabular-nums"
                >
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  Call 9720241212
                </a>
                <a
                  href="tel:+919012792020"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-[#18181b] text-xs font-medium hover:border-[#9a7b3e] tabular-nums"
                >
                  <Phone className="h-3.5 w-3.5 text-[#9a7b3e]" aria-hidden="true" />
                  Call 9012792020
                </a>
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-[#18181b] text-xs font-medium hover:border-[#9a7b3e]"
                >
                  <Mail className="h-3.5 w-3.5 text-[#9a7b3e]" aria-hidden="true" />
                  Send Email
                </a>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg bg-[#15803d] text-white text-xs font-medium hover:bg-[#166534]"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  WhatsApp Chat
                </a>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-7 sm:p-9">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#18181b] mb-2">
              Send Us a Message
            </h2>
            <p className="text-sm text-stone-600 mb-6">
              Submit your inquiry below and our office will contact you promptly with verified property options.
            </p>
            <InquiryForm />
          </div>
        </div>
      </section>

      {/* MAP / LOCATION SECTION */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[#9a7b3e]">Office Location</p>
              <h2 className="font-display text-3xl font-semibold text-[#18181b]">
                Find Us at Mandi Choraha, Mathura
              </h2>
              <p className="text-sm text-stone-600 mt-1">
                Mandi Choraha, Near Shree Ram Sonk Road, Mathura, Uttar Pradesh – 281004
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9a7b3e] hover:underline whitespace-nowrap"
            >
              Open in Google Maps
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 h-[380px]">
            <iframe
              title="Shri Goyal Associate Office Location – Mandi Choraha, Near Shree Ram Sonk Road, Mathura"
              src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="border-0 w-full h-full"
            />
          </div>
        </div>
      </section>
    </>
  );
}
