export const PROPERTY_TYPES = [
  'Residential',
  'Commercial',
  'Plot',
  'Villa',
  'Apartment',
  'House',
  'Shop',
  'Office',
  'Land',
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const LISTING_TYPES = ['Sale', 'Rent'] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const PROPERTY_STATUSES = ['Available', 'Sold', 'Rented', 'Draft'] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const INQUIRY_STATUSES = ['New', 'Contacted', 'Closed'] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export interface PropertyImageRecord {
  id: string;
  propertyId: string;
  storagePath: string;
  publicUrl: string;
  caption: string;
  altText: string;
  sortOrder: number;
  isCover: boolean;
  createdAt: string;
}

export interface PropertyRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  price: number;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  area: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  features: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  coverImage?: string | null;
  coverAlt?: string | null;
  images?: PropertyImageRecord[];
}

export interface InquiryRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  propertyId: string | null;
  status: InquiryStatus;
  createdAt: string;
  propertyTitle?: string | null;
  propertySlug?: string | null;
}

export interface MediaItemRecord extends PropertyImageRecord {
  propertyTitle: string | null;
  propertySlug: string | null;
}

export interface DashboardStats {
  totalProperties: number;
  availableProperties: number;
  soldProperties: number;
  rentalProperties: number;
  featuredProperties: number;
  totalInquiries: number;
  newInquiries: number;
  recentProperties: PropertyRecord[];
  recentInquiries: InquiryRecord[];
}

export interface PropertyFilters {
  location?: string;
  propertyType?: string;
  listingType?: string;
  status?: string;
  maxPrice?: string;
  bedrooms?: string;
  minArea?: string;
  featured?: string;
}
