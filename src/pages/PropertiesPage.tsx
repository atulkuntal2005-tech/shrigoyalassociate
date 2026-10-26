import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RotateCcw, Search } from 'lucide-react';
import {
  LISTING_TYPES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  type PropertyRecord,
} from '../types';
import { fetchPublicProperties } from '../lib/api';
import { SEOHead } from '../components/SEOHead';
import { PropertyCard } from '../components/PropertyCard';
import { Skeleton } from '../components/ui/skeleton';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const PUBLIC_STATUSES = PROPERTY_STATUSES.filter((s) => s !== 'Draft');

export function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [locationFilter, setLocationFilter] = useState(
    searchParams.get('location') || ''
  );
  const [propertyType, setPropertyType] = useState(
    searchParams.get('propertyType') || 'All'
  );
  const [listingType, setListingType] = useState(
    searchParams.get('listingType') || 'All'
  );
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || 'All');
  const [minArea, setMinArea] = useState(searchParams.get('minArea') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');

  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocationFilter(searchParams.get('location') || '');
    setPropertyType(searchParams.get('propertyType') || 'All');
    setListingType(searchParams.get('listingType') || 'All');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setBedrooms(searchParams.get('bedrooms') || 'All');
    setMinArea(searchParams.get('minArea') || '');
    setStatus(searchParams.get('status') || 'All');
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPublicProperties({
      location: locationFilter,
      propertyType,
      listingType,
      maxPrice,
      bedrooms,
      minArea,
      status,
    })
      .then((list) => {
        if (!active) return;
        setProperties(list);
        setError(null);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message || 'Failed to load properties.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [locationFilter, propertyType, listingType, maxPrice, bedrooms, minArea, status]);

  const syncUrlParams = (next: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v && v !== 'All') params.set(k, v);
    });
    setSearchParams(params, { replace: true });
  };

  const handleFilterChange = (field: string, value: string) => {
    const updated = {
      location: field === 'location' ? value : locationFilter,
      propertyType: field === 'propertyType' ? value : propertyType,
      listingType: field === 'listingType' ? value : listingType,
      maxPrice: field === 'maxPrice' ? value : maxPrice,
      bedrooms: field === 'bedrooms' ? value : bedrooms,
      minArea: field === 'minArea' ? value : minArea,
      status: field === 'status' ? value : status,
    };
    syncUrlParams(updated);
  };

  const resetFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (locationFilter.trim()) count++;
    if (propertyType !== 'All') count++;
    if (listingType !== 'All') count++;
    if (maxPrice) count++;
    if (bedrooms !== 'All') count++;
    if (minArea) count++;
    if (status !== 'All') count++;
    return count;
  }, [locationFilter, propertyType, listingType, maxPrice, bedrooms, minArea, status]);

  return (
    <>
      <SEOHead
        title="Properties for Sale & Rent in Mathura | Shri Goyal Associate"
        description="Browse verified residential villas, apartments, MVDA plots, commercial showrooms, and offices for sale and rent in Mathura and Vrindavan."
        canonicalPath="/properties"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Properties in Mathura & Vrindavan – Shri Goyal Associate',
          url: 'https://www.shrigoyalassociate.in/properties',
          description:
            'Verified villas, apartments, commercial properties, and residential plots in Mathura by Jitendra Goyal and Hemant Goyal.',
        }}
      />

      <section className="border-b border-stone-200/80 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-stone-500 mb-3">
            <Link to="/" className="hover:text-[#9a7b3e]">
              Home
            </Link>{' '}
            <span aria-hidden="true">/</span>{' '}
            <span className="text-stone-800">Properties</span>
          </nav>

          {/* SINGLE H1 ON PROPERTIES PAGE */}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#18181b]">
            Verified Properties in Mathura &amp; Vrindavan
          </h1>
          <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl">
            Filter residential villas, apartments, plots, commercial complexes, and rental mandates curated by Shri Goyal Associate.
          </p>

          {/* WORKING FILTERS PANEL */}
          <div className="mt-8 rounded-xl border border-stone-200 bg-[#faf9f6] p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Location */}
              <div className="space-y-1">
                <label
                  htmlFor="filter-location"
                  className="block text-xs font-medium text-stone-700"
                >
                  Location / Keyword
                </label>
                <div className="relative">
                  <Search
                    className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <Input
                    id="filter-location"
                    value={locationFilter}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="Sonk Road, Vrindavan, Mandi Choraha..."
                    className="pl-9"
                  />
                </div>
              </div>

              {/* 2. Property Type */}
              <div className="space-y-1">
                <label
                  htmlFor="filter-type"
                  className="block text-xs font-medium text-stone-700"
                >
                  Property Type
                </label>
                <select
                  id="filter-type"
                  value={propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="flex min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-[#18181b] focus-visible:outline-none focus-visible:border-[#9a7b3e]"
                >
                  <option value="All">All Types</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Listing Type */}
              <div className="space-y-1">
                <label
                  htmlFor="filter-listing"
                  className="block text-xs font-medium text-stone-700"
                >
                  Listing Type
                </label>
                <select
                  id="filter-listing"
                  value={listingType}
                  onChange={(e) => handleFilterChange('listingType', e.target.value)}
                  className="flex min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-[#18181b] focus-visible:outline-none focus-visible:border-[#9a7b3e]"
                >
                  <option value="All">Sale &amp; Rent</option>
                  {LISTING_TYPES.map((lt) => (
                    <option key={lt} value={lt}>
                      For {lt}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Price */}
              <div className="space-y-1">
                <label
                  htmlFor="filter-price"
                  className="block text-xs font-medium text-stone-700"
                >
                  Maximum Price
                </label>
                <select
                  id="filter-price"
                  value={maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="flex min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-[#18181b] focus-visible:outline-none focus-visible:border-[#9a7b3e]"
                >
                  <option value="">No Upper Limit</option>
                  <option value="100000">Up to ₹1 Lakh (Rent)</option>
                  <option value="5000000">Up to ₹50 Lakh</option>
                  <option value="10000000">Up to ₹1 Crore</option>
                  <option value="25000000">Up to ₹2.5 Crore</option>
                  <option value="50000000">Up to ₹5 Crore</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
              {/* 5. Bedrooms */}
              <div className="space-y-1">
                <label
                  htmlFor="filter-bedrooms"
                  className="block text-xs font-medium text-stone-700"
                >
                  Minimum Bedrooms
                </label>
                <select
                  id="filter-bedrooms"
                  value={bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="flex min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-[#18181b] focus-visible:outline-none focus-visible:border-[#9a7b3e]"
                >
                  <option value="All">Any Bedrooms</option>
                  <option value="1">1+ Bedroom</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                </select>
              </div>

              {/* 6. Area */}
              <div className="space-y-1">
                <label
                  htmlFor="filter-area"
                  className="block text-xs font-medium text-stone-700"
                >
                  Minimum Area (sq.ft)
                </label>
                <select
                  id="filter-area"
                  value={minArea}
                  onChange={(e) => handleFilterChange('minArea', e.target.value)}
                  className="flex min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-[#18181b] focus-visible:outline-none focus-visible:border-[#9a7b3e]"
                >
                  <option value="">Any Area</option>
                  <option value="1000">1,000+ sq.ft</option>
                  <option value="1800">1,800+ sq.ft</option>
                  <option value="2500">2,500+ sq.ft</option>
                  <option value="3500">3,500+ sq.ft</option>
                </select>
              </div>

              {/* 7. Status */}
              <div className="space-y-1">
                <label
                  htmlFor="filter-status"
                  className="block text-xs font-medium text-stone-700"
                >
                  Availability Status
                </label>
                <select
                  id="filter-status"
                  value={status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="flex min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-[#18181b] focus-visible:outline-none focus-visible:border-[#9a7b3e]"
                >
                  <option value="All">All Statuses</option>
                  {PUBLIC_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                {activeFilterCount > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetFilters}
                    className="w-full sm:w-auto"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Reset Filters ({activeFilterCount})
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROPERTY RESULTS */}
      <section className="py-14 bg-[#faf9f6]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold text-[#18181b]">
              {loading
                ? 'Loading Properties...'
                : `${properties.length} ${
                    properties.length === 1 ? 'Property' : 'Properties'
                  } Found`}
            </h2>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
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
          ) : properties.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center space-y-4">
              <h3 className="font-display text-2xl font-semibold text-[#18181b]">
                No Properties Match Your Exact Filter Criteria
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Try clearing one or more filters, or contact Shri Goyal Associate for off-market plots, villas, and commercial spaces in Mathura.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button type="button" variant="default" onClick={resetFilters}>
                  Reset All Filters
                </Button>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center min-h-[42px] px-5 py-2.5 rounded-lg border border-stone-300 text-sm font-medium text-[#18181b] hover:border-[#9a7b3e]"
                >
                  Share Custom Requirement
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((prop, index) => (
                <PropertyCard key={prop.id} property={prop} priority={index < 3} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
