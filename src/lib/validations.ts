import { z } from 'zod';
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_STATUSES,
  INQUIRY_STATUSES,
} from '../types/index.ts';

export const inquiryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name (at least 2 characters).')
    .max(100, 'Name must be under 100 characters.'),
  phone: z
    .string()
    .trim()
    .regex(
      /^[+]?[0-9\s-]{10,15}$/,
      'Please enter a valid 10-digit Indian mobile or phone number.'
    ),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.'),
  message: z
    .string()
    .trim()
    .min(10, 'Please enter a message of at least 10 characters.')
    .max(2000, 'Message cannot exceed 2000 characters.'),
  propertyId: z.string().uuid().nullable().optional().or(z.literal('')),
});

export type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

export const propertyFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Property title must be at least 5 characters.')
    .max(180, 'Property title must be under 180 characters.'),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug must be at least 3 characters.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only.')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .trim()
    .min(20, 'Description must be at least 20 characters.'),
  location: z
    .string()
    .trim()
    .min(3, 'Location is required.'),
  price: z.coerce
    .number()
    .positive('Price must be greater than 0.'),
  propertyType: z.enum(PROPERTY_TYPES),
  listingType: z.enum(LISTING_TYPES),
  status: z.enum(PROPERTY_STATUSES),
  area: z.coerce
    .number()
    .int('Area must be a whole number in sq. ft.')
    .positive('Area must be greater than 0 sq. ft.'),
  bedrooms: z.coerce
    .number()
    .int()
    .min(0, 'Bedrooms cannot be negative.')
    .max(50),
  bathrooms: z.coerce
    .number()
    .int()
    .min(0, 'Bathrooms cannot be negative.')
    .max(50),
  amenities: z.array(z.string().trim().min(1)).default([]),
  features: z.array(z.string().trim().min(1)).default([]),
  featured: z.boolean().default(false),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export const inquiryStatusUpdateSchema = z.object({
  status: z.enum(INQUIRY_STATUSES),
});

export const imageMetadataSchema = z.object({
  caption: z.string().max(300).optional(),
  altText: z.string().max(300).optional(),
  isCover: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});
