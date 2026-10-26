import { relations } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  role: text('role').notNull().default('admin'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const properties = pgTable(
  'properties',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description').notNull(),
    location: text('location').notNull(),
    price: bigint('price', { mode: 'number' }).notNull(),
    propertyType: text('property_type').notNull(),
    listingType: text('listing_type').notNull(),
    status: text('status').notNull().default('Available'),
    area: integer('area').notNull(),
    bedrooms: integer('bedrooms').notNull().default(0),
    bathrooms: integer('bathrooms').notNull().default(0),
    amenities: jsonb('amenities').$type<string[]>().notNull().default([]),
    features: jsonb('features').$type<string[]>().notNull().default([]),
    featured: boolean('featured').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_properties_slug').on(table.slug),
    index('idx_properties_status').on(table.status),
    index('idx_properties_property_type').on(table.propertyType),
    index('idx_properties_listing_type').on(table.listingType),
    index('idx_properties_featured').on(table.featured),
    index('idx_properties_price').on(table.price),
    index('idx_properties_location').on(table.location),
  ]
);

export const propertyImages = pgTable(
  'property_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    propertyId: uuid('property_id')
      .references(() => properties.id, { onDelete: 'cascade' })
      .notNull(),
    storagePath: text('storage_path').notNull(),
    publicUrl: text('public_url').notNull(),
    caption: text('caption').notNull().default(''),
    altText: text('alt_text').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
    isCover: boolean('is_cover').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_property_images_property_id').on(table.propertyId),
    index('idx_property_images_is_cover').on(table.isCover),
    index('idx_property_images_sort_order').on(table.sortOrder),
  ]
);

export const inquiries = pgTable(
  'inquiries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    email: text('email').notNull(),
    message: text('message').notNull(),
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'set null' }),
    status: text('status').notNull().default('New'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_inquiries_status').on(table.status),
    index('idx_inquiries_property_id').on(table.propertyId),
    index('idx_inquiries_created_at').on(table.createdAt),
  ]
);

export const propertiesRelations = relations(properties, ({ many }) => ({
  images: many(propertyImages),
  inquiries: many(inquiries),
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, {
    fields: [propertyImages.propertyId],
    references: [properties.id],
  }),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  property: one(properties, {
    fields: [inquiries.propertyId],
    references: [properties.id],
  }),
}));
