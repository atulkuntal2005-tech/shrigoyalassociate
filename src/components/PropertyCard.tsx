import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { PropertyRecord } from '../types';
import { formatINR } from '../lib/utils';
import { SmartImage } from './SmartImage';

interface PropertyCardProps {
  property: PropertyRecord;
  priority?: boolean;
}

export function PropertyCard({ property, priority = false }: PropertyCardProps) {
  const statusColor =
    property.status === 'Available'
      ? 'text-emerald-800'
      : property.status === 'Sold'
      ? 'text-red-700'
      : 'text-amber-800';

  return (
    <article className="group flex flex-col rounded-xl border border-stone-200/90 bg-white overflow-hidden transition-colors duration-150 hover:border-[#9a7b3e]/60">
      <Link
        to={`/properties/${property.slug}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-stone-100"
      >
        <SmartImage
          src={property.coverImage}
          alt={
            property.coverAlt ||
            `${property.title} – ${property.propertyType} for ${property.listingType} in ${property.location}`
          }
          width={800}
          height={600}
          priority={priority}
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          {/* Unboxed clean metadata with typographic separators (Zero-Pill Discipline) */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-stone-500 mb-2">
            <span className="text-[#9a7b3e]">{property.propertyType}</span>
            <span aria-hidden="true">·</span>
            <span>For {property.listingType}</span>
            <span aria-hidden="true">·</span>
            <span className={statusColor}>{property.status}</span>
            {property.featured && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-stone-700">Featured</span>
              </>
            )}
          </div>

          <h3 className="font-display text-xl font-semibold text-[#18181b] leading-snug mb-1.5 group-hover:text-[#9a7b3e] transition-colors">
            <Link to={`/properties/${property.slug}`} className="line-clamp-2">
              {property.title}
            </Link>
          </h3>

          <p className="flex items-center gap-1.5 text-sm text-stone-600 mb-4">
            <MapPin className="h-3.5 w-3.5 text-[#9a7b3e] shrink-0" aria-hidden="true" />
            <span className="truncate">{property.location}</span>
          </p>
        </div>

        <div className="pt-4 border-t border-stone-100 space-y-4">
          {/* Tabular specifications */}
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-stone-600 tabular-nums">
            <span>{property.area.toLocaleString('en-IN')} sq.ft</span>
            {property.bedrooms > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                </span>
              </>
            )}
            {property.bathrooms > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-lg font-semibold text-[#18181b] tabular-nums">
              {formatINR(property.price, property.listingType)}
            </p>
            <Link
              to={`/properties/${property.slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#18181b] hover:text-[#9a7b3e] transition-colors whitespace-nowrap shrink-0"
            >
              View Details
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
