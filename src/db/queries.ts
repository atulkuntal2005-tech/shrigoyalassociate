import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  ne,
  or,
} from 'drizzle-orm';
import { db } from './index.ts';
import { inquiries, properties, propertyImages } from './schema.ts';
import { slugify } from '../lib/utils.ts';
import type {
  DashboardStats,
  InquiryRecord,
  InquiryStatus,
  MediaItemRecord,
  PropertyFilters,
  PropertyImageRecord,
  PropertyRecord,
  PropertyStatus,
  PropertyType,
  ListingType,
} from '../types/index.ts';
import type { InquiryFormValues, PropertyFormValues } from '../lib/validations.ts';

function serializeImage(img: typeof propertyImages.$inferSelect): PropertyImageRecord {
  return {
    id: img.id,
    propertyId: img.propertyId,
    storagePath: img.storagePath,
    publicUrl: img.publicUrl,
    caption: img.caption,
    altText: img.altText,
    sortOrder: img.sortOrder,
    isCover: img.isCover,
    createdAt: img.createdAt.toISOString(),
  };
}

function serializeProperty(
  prop: typeof properties.$inferSelect,
  imgs: PropertyImageRecord[] = []
): PropertyRecord {
  const sortedImages = [...imgs].sort((a, b) => {
    if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });
  const cover = sortedImages[0];

  return {
    id: prop.id,
    title: prop.title,
    slug: prop.slug,
    description: prop.description,
    location: prop.location,
    price: Number(prop.price),
    propertyType: prop.propertyType as PropertyType,
    listingType: prop.listingType as ListingType,
    status: prop.status as PropertyStatus,
    area: prop.area,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    amenities: Array.isArray(prop.amenities) ? prop.amenities : [],
    features: Array.isArray(prop.features) ? prop.features : [],
    featured: prop.featured,
    createdAt: prop.createdAt.toISOString(),
    updatedAt: prop.updatedAt.toISOString(),
    coverImage: cover?.publicUrl || null,
    coverAlt: cover?.altText || `${prop.title} in ${prop.location}`,
    images: sortedImages,
  };
}

async function attachImagesToProperties(
  rows: (typeof properties.$inferSelect)[]
): Promise<PropertyRecord[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const allImgs = await db
    .select()
    .from(propertyImages)
    .where(inArray(propertyImages.propertyId, ids))
    .orderBy(asc(propertyImages.sortOrder), asc(propertyImages.createdAt));

  const mapByProp = new Map<string, PropertyImageRecord[]>();
  for (const img of allImgs) {
    const list = mapByProp.get(img.propertyId) || [];
    list.push(serializeImage(img));
    mapByProp.set(img.propertyId, list);
  }

  return rows.map((row) => serializeProperty(row, mapByProp.get(row.id) || []));
}

export async function getPublicProperties(
  filters: PropertyFilters = {}
): Promise<PropertyRecord[]> {
  try {
    const conditions = [ne(properties.status, 'Draft')];

    if (filters.location && filters.location.trim() !== '') {
      const q = `%${filters.location.trim()}%`;
      const orCondition = or(
        ilike(properties.location, q),
        ilike(properties.title, q),
        ilike(properties.description, q)
      );
      if (orCondition) conditions.push(orCondition);
    }

    if (filters.propertyType && filters.propertyType !== 'All') {
      conditions.push(eq(properties.propertyType, filters.propertyType));
    }

    if (filters.listingType && filters.listingType !== 'All') {
      conditions.push(eq(properties.listingType, filters.listingType));
    }

    if (filters.status && filters.status !== 'All') {
      conditions.push(eq(properties.status, filters.status));
    }

    if (filters.maxPrice && Number(filters.maxPrice) > 0) {
      conditions.push(lte(properties.price, Number(filters.maxPrice)));
    }

    if (filters.bedrooms && filters.bedrooms !== 'All') {
      const beds = Number(filters.bedrooms);
      if (!Number.isNaN(beds) && beds > 0) {
        conditions.push(gte(properties.bedrooms, beds));
      }
    }

    if (filters.minArea && Number(filters.minArea) > 0) {
      conditions.push(gte(properties.area, Number(filters.minArea)));
    }

    if (filters.featured === 'true') {
      conditions.push(eq(properties.featured, true));
    }

    const rows = await db
      .select()
      .from(properties)
      .where(and(...conditions))
      .orderBy(desc(properties.featured), desc(properties.createdAt));

    return await attachImagesToProperties(rows);
  } catch (error) {
    console.error('Error fetching public properties:', error);
    throw new Error('Unable to load properties at this moment. Please try again shortly.', {
      cause: error,
    });
  }
}

export async function getPublicPropertyBySlug(slug: string): Promise<{
  property: PropertyRecord | null;
  relatedProperties: PropertyRecord[];
}> {
  try {
    const rows = await db
      .select()
      .from(properties)
      .where(and(eq(properties.slug, slug), ne(properties.status, 'Draft')))
      .limit(1);

    if (rows.length === 0) {
      return { property: null, relatedProperties: [] };
    }

    const [property] = await attachImagesToProperties(rows);

    const relatedRows = await db
      .select()
      .from(properties)
      .where(and(ne(properties.id, property.id), ne(properties.status, 'Draft')))
      .orderBy(desc(properties.featured), desc(properties.createdAt))
      .limit(3);

    const relatedProperties = await attachImagesToProperties(relatedRows);

    return { property, relatedProperties };
  } catch (error) {
    console.error('Error fetching property by slug:', error);
    throw new Error('Unable to load property details. Please try again later.', {
      cause: error,
    });
  }
}

export async function getAllAdminProperties(): Promise<PropertyRecord[]> {
  try {
    const rows = await db
      .select()
      .from(properties)
      .orderBy(desc(properties.createdAt));
    return await attachImagesToProperties(rows);
  } catch (error) {
    console.error('Error fetching admin properties:', error);
    throw new Error('Failed to load properties list.', { cause: error });
  }
}

export async function getAdminPropertyById(id: string): Promise<PropertyRecord | null> {
  try {
    const rows = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);
    if (rows.length === 0) return null;
    const [prop] = await attachImagesToProperties(rows);
    return prop;
  } catch (error) {
    console.error('Error fetching admin property by id:', error);
    throw new Error('Failed to load property record.', { cause: error });
  }
}

async function generateUniqueSlug(baseText: string, excludeId?: string): Promise<string> {
  const base = slugify(baseText) || `property-${Date.now()}`;
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, candidate))
      .limit(1);

    if (existing.length === 0 || (excludeId && existing[0].id === excludeId)) {
      return candidate;
    }
    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

export async function createPropertyRecord(data: PropertyFormValues): Promise<PropertyRecord> {
  try {
    const uniqueSlug = await generateUniqueSlug(data.slug || data.title);
    const [inserted] = await db
      .insert(properties)
      .values({
        title: data.title,
        slug: uniqueSlug,
        description: data.description,
        location: data.location,
        price: Math.round(data.price),
        propertyType: data.propertyType,
        listingType: data.listingType,
        status: data.status,
        area: Math.round(data.area),
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        amenities: data.amenities,
        features: data.features,
        featured: data.featured,
      })
      .returning();

    return serializeProperty(inserted, []);
  } catch (error) {
    console.error('Error creating property:', error);
    throw new Error('Failed to create property. Please check inputs and try again.', {
      cause: error,
    });
  }
}

export async function updatePropertyRecord(
  id: string,
  data: PropertyFormValues
): Promise<PropertyRecord | null> {
  try {
    const uniqueSlug = await generateUniqueSlug(data.slug || data.title, id);
    const [updated] = await db
      .update(properties)
      .set({
        title: data.title,
        slug: uniqueSlug,
        description: data.description,
        location: data.location,
        price: Math.round(data.price),
        propertyType: data.propertyType,
        listingType: data.listingType,
        status: data.status,
        area: Math.round(data.area),
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        amenities: data.amenities,
        features: data.features,
        featured: data.featured,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();

    if (!updated) return null;
    const [withImages] = await attachImagesToProperties([updated]);
    return withImages;
  } catch (error) {
    console.error('Error updating property:', error);
    throw new Error('Failed to update property record.', { cause: error });
  }
}

export async function deletePropertyRecord(id: string): Promise<{
  deleted: boolean;
  storagePaths: string[];
}> {
  try {
    const imgs = await db
      .select({ storagePath: propertyImages.storagePath })
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, id));

    const storagePaths = imgs.map((i) => i.storagePath);
    const deletedRows = await db
      .delete(properties)
      .where(eq(properties.id, id))
      .returning({ id: properties.id });

    return {
      deleted: deletedRows.length > 0,
      storagePaths,
    };
  } catch (error) {
    console.error('Error deleting property:', error);
    throw new Error('Failed to delete property.', { cause: error });
  }
}

export async function addPropertyImages(
  propertyId: string,
  files: Array<{
    storagePath: string;
    publicUrl: string;
    caption: string;
    altText: string;
  }>
): Promise<PropertyImageRecord[]> {
  try {
    const existing = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId))
      .orderBy(asc(propertyImages.sortOrder));

    const hasCover = existing.some((i) => i.isCover);
    const maxSort = existing.reduce((max, item) => Math.max(max, item.sortOrder), -1);

    const toInsert = files.map((file, idx) => ({
      propertyId,
      storagePath: file.storagePath,
      publicUrl: file.publicUrl,
      caption: file.caption,
      altText: file.altText,
      sortOrder: maxSort + 1 + idx,
      isCover: !hasCover && idx === 0,
    }));

    const inserted = await db.insert(propertyImages).values(toInsert).returning();
    return inserted.map(serializeImage);
  } catch (error) {
    console.error('Error inserting property images:', error);
    throw new Error('Failed to save uploaded images.', { cause: error });
  }
}

export async function updatePropertyImageMetadata(
  imageId: string,
  updates: {
    caption?: string;
    altText?: string;
    isCover?: boolean;
    sortOrder?: number;
  }
): Promise<PropertyImageRecord | null> {
  try {
    const currentRows = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.id, imageId))
      .limit(1);
    if (currentRows.length === 0) return null;
    const current = currentRows[0];

    if (updates.isCover === true) {
      await db
        .update(propertyImages)
        .set({ isCover: false })
        .where(eq(propertyImages.propertyId, current.propertyId));
    }

    const [updated] = await db
      .update(propertyImages)
      .set({
        caption: updates.caption !== undefined ? updates.caption : current.caption,
        altText: updates.altText !== undefined ? updates.altText : current.altText,
        isCover: updates.isCover !== undefined ? updates.isCover : current.isCover,
        sortOrder: updates.sortOrder !== undefined ? updates.sortOrder : current.sortOrder,
      })
      .where(eq(propertyImages.id, imageId))
      .returning();

    return updated ? serializeImage(updated) : null;
  } catch (error) {
    console.error('Error updating property image metadata:', error);
    throw new Error('Failed to update image metadata.', { cause: error });
  }
}

export async function reorderPropertyImages(
  propertyId: string,
  orderedIds: string[]
): Promise<PropertyImageRecord[]> {
  try {
    for (let idx = 0; idx < orderedIds.length; idx += 1) {
      await db
        .update(propertyImages)
        .set({ sortOrder: idx })
        .where(
          and(
            eq(propertyImages.id, orderedIds[idx]),
            eq(propertyImages.propertyId, propertyId)
          )
        );
    }

    const updated = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId))
      .orderBy(asc(propertyImages.sortOrder));
    return updated.map(serializeImage);
  } catch (error) {
    console.error('Error reordering property images:', error);
    throw new Error('Failed to reorder images.', { cause: error });
  }
}

export async function deletePropertyImage(imageId: string): Promise<{
  deleted: boolean;
  storagePath: string | null;
}> {
  try {
    const rows = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.id, imageId))
      .limit(1);
    if (rows.length === 0) return { deleted: false, storagePath: null };

    const target = rows[0];
    await db.delete(propertyImages).where(eq(propertyImages.id, imageId));

    if (target.isCover) {
      const remaining = await db
        .select()
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, target.propertyId))
        .orderBy(asc(propertyImages.sortOrder))
        .limit(1);
      if (remaining.length > 0) {
        await db
          .update(propertyImages)
          .set({ isCover: true })
          .where(eq(propertyImages.id, remaining[0].id));
      }
    }

    return { deleted: true, storagePath: target.storagePath };
  } catch (error) {
    console.error('Error deleting property image:', error);
    throw new Error('Failed to delete image.', { cause: error });
  }
}

export async function getAllMediaItems(search?: string): Promise<MediaItemRecord[]> {
  try {
    const rows = await db
      .select({
        image: propertyImages,
        propertyTitle: properties.title,
        propertySlug: properties.slug,
      })
      .from(propertyImages)
      .leftJoin(properties, eq(propertyImages.propertyId, properties.id))
      .orderBy(desc(propertyImages.createdAt));

    const mapped: MediaItemRecord[] = rows.map((r) => ({
      ...serializeImage(r.image),
      propertyTitle: r.propertyTitle || null,
      propertySlug: r.propertySlug || null,
    }));

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      return mapped.filter(
        (m) =>
          m.caption.toLowerCase().includes(q) ||
          m.altText.toLowerCase().includes(q) ||
          (m.propertyTitle || '').toLowerCase().includes(q) ||
          m.storagePath.toLowerCase().includes(q)
      );
    }

    return mapped;
  } catch (error) {
    console.error('Error fetching media library:', error);
    throw new Error('Failed to load media library.', { cause: error });
  }
}

export async function createInquiryRecord(
  data: InquiryFormValues
): Promise<{ inquiry: InquiryRecord; propertyTitle: string | null }> {
  try {
    const validPropertyId =
      data.propertyId && data.propertyId.trim() !== '' ? data.propertyId : null;

    let propertyTitle: string | null = null;
    let propertySlug: string | null = null;

    if (validPropertyId) {
      const propRows = await db
        .select({ title: properties.title, slug: properties.slug })
        .from(properties)
        .where(eq(properties.id, validPropertyId))
        .limit(1);
      if (propRows.length > 0) {
        propertyTitle = propRows[0].title;
        propertySlug = propRows[0].slug;
      }
    }

    const [inserted] = await db
      .insert(inquiries)
      .values({
        name: data.name,
        phone: data.phone,
        email: data.email,
        message: data.message,
        propertyId: propertyTitle ? validPropertyId : null,
        status: 'New',
      })
      .returning();

    return {
      inquiry: {
        id: inserted.id,
        name: inserted.name,
        phone: inserted.phone,
        email: inserted.email,
        message: inserted.message,
        propertyId: inserted.propertyId,
        status: inserted.status as InquiryStatus,
        createdAt: inserted.createdAt.toISOString(),
        propertyTitle,
        propertySlug,
      },
      propertyTitle,
    };
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw new Error('Failed to submit your inquiry. Please try again or call us directly.', {
      cause: error,
    });
  }
}

export async function getAdminInquiries(filters?: {
  status?: string;
  search?: string;
}): Promise<InquiryRecord[]> {
  try {
    const rows = await db
      .select({
        inquiry: inquiries,
        propertyTitle: properties.title,
        propertySlug: properties.slug,
      })
      .from(inquiries)
      .leftJoin(properties, eq(inquiries.propertyId, properties.id))
      .orderBy(desc(inquiries.createdAt));

    let list: InquiryRecord[] = rows.map((r) => ({
      id: r.inquiry.id,
      name: r.inquiry.name,
      phone: r.inquiry.phone,
      email: r.inquiry.email,
      message: r.inquiry.message,
      propertyId: r.inquiry.propertyId,
      status: r.inquiry.status as InquiryStatus,
      createdAt: r.inquiry.createdAt.toISOString(),
      propertyTitle: r.propertyTitle || null,
      propertySlug: r.propertySlug || null,
    }));

    if (filters?.status && filters.status !== 'All') {
      list = list.filter((i) => i.status === filters.status);
    }

    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.phone.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.message.toLowerCase().includes(q) ||
          (i.propertyTitle || '').toLowerCase().includes(q)
      );
    }

    return list;
  } catch (error) {
    console.error('Error fetching admin inquiries:', error);
    throw new Error('Failed to load inquiries.', { cause: error });
  }
}

export async function updateInquiryStatusRecord(
  id: string,
  status: InquiryStatus
): Promise<InquiryRecord | null> {
  try {
    const [updated] = await db
      .update(inquiries)
      .set({ status })
      .where(eq(inquiries.id, id))
      .returning();

    if (!updated) return null;
    return {
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      email: updated.email,
      message: updated.message,
      propertyId: updated.propertyId,
      status: updated.status as InquiryStatus,
      createdAt: updated.createdAt.toISOString(),
    };
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    throw new Error('Failed to update inquiry status.', { cause: error });
  }
}

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  try {
    const allProps = await getAllAdminProperties();
    const allInqs = await getAdminInquiries();

    return {
      totalProperties: allProps.length,
      availableProperties: allProps.filter((p) => p.status === 'Available').length,
      soldProperties: allProps.filter((p) => p.status === 'Sold').length,
      rentalProperties: allProps.filter((p) => p.listingType === 'Rent').length,
      featuredProperties: allProps.filter((p) => p.featured).length,
      totalInquiries: allInqs.length,
      newInquiries: allInqs.filter((i) => i.status === 'New').length,
      recentProperties: allProps.slice(0, 5),
      recentInquiries: allInqs.slice(0, 6),
    };
  } catch (error) {
    console.error('Error computing dashboard stats:', error);
    throw new Error('Failed to load dashboard overview.', { cause: error });
  }
}

export async function getSitemapPropertyEntries(): Promise<
  Array<{ slug: string; updatedAt: string }>
> {
  try {
    const rows = await db
      .select({
        slug: properties.slug,
        updatedAt: properties.updatedAt,
      })
      .from(properties)
      .where(ne(properties.status, 'Draft'))
      .orderBy(desc(properties.updatedAt));

    return rows.map((r) => ({
      slug: r.slug,
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error generating sitemap entries:', error);
    return [];
  }
}
