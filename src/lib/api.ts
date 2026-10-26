import type {
  DashboardStats,
  InquiryRecord,
  InquiryStatus,
  MediaItemRecord,
  PropertyFilters,
  PropertyImageRecord,
  PropertyRecord,
} from '../types';
import type { InquiryFormValues, PropertyFormValues } from './validations';

export interface DashboardResponse extends DashboardStats {
  seo: {
    domain: string;
    sitemapUrl: string;
    robotsUrl: string;
    indexedUrlsCount: number;
    verificationTokenConfigured: boolean;
  };
}

async function handleJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export async function fetchPublicProperties(
  filters: PropertyFilters = {}
): Promise<PropertyRecord[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'All') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  const res = await fetch(`/api/properties${qs ? `?${qs}` : ''}`);
  const data = await handleJson<{ properties: PropertyRecord[] }>(res);
  return data.properties;
}

export async function fetchPublicPropertyBySlug(slug: string): Promise<{
  property: PropertyRecord;
  relatedProperties: PropertyRecord[];
}> {
  const res = await fetch(`/api/properties/${encodeURIComponent(slug)}`);
  return handleJson<{ property: PropertyRecord; relatedProperties: PropertyRecord[] }>(res);
}

export async function submitPublicInquiry(payload: InquiryFormValues): Promise<{
  inquiry: InquiryRecord;
  emailNotificationSent: boolean;
  recipient: string;
}> {
  const res = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function fetchAdminDashboard(token: string): Promise<DashboardResponse> {
  const res = await fetch('/api/admin/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleJson<DashboardResponse>(res);
}

export async function triggerSitemapVerification(token: string): Promise<{
  success: boolean;
  sitemapUrl: string;
  totalUrlsIndexed: number;
  verifiedAt: string;
  message: string;
}> {
  const res = await fetch('/api/admin/seo/submit-sitemap', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleJson(res);
}

export async function fetchAdminProperties(token: string): Promise<PropertyRecord[]> {
  const res = await fetch('/api/admin/properties', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await handleJson<{ properties: PropertyRecord[] }>(res);
  return data.properties;
}

export async function fetchAdminPropertyById(
  token: string,
  id: string
): Promise<PropertyRecord> {
  const res = await fetch(`/api/admin/properties/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await handleJson<{ property: PropertyRecord }>(res);
  return data.property;
}

export async function createAdminProperty(
  token: string,
  values: PropertyFormValues
): Promise<PropertyRecord> {
  const res = await fetch('/api/admin/properties', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  const data = await handleJson<{ property: PropertyRecord }>(res);
  return data.property;
}

export async function updateAdminProperty(
  token: string,
  id: string,
  values: PropertyFormValues
): Promise<PropertyRecord> {
  const res = await fetch(`/api/admin/properties/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  const data = await handleJson<{ property: PropertyRecord }>(res);
  return data.property;
}

export async function deleteAdminProperty(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/properties/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleJson(res);
}

export async function uploadAdminPropertyImages(
  token: string,
  propertyId: string,
  files: File[],
  caption?: string,
  altText?: string
): Promise<PropertyImageRecord[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append('images', f));
  if (caption) formData.append('caption', caption);
  if (altText) formData.append('altText', altText);

  const res = await fetch(
    `/api/admin/properties/${encodeURIComponent(propertyId)}/images`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );
  const data = await handleJson<{ images: PropertyImageRecord[] }>(res);
  return data.images;
}

export async function updateAdminImageMetadata(
  token: string,
  imageId: string,
  updates: {
    caption?: string;
    altText?: string;
    isCover?: boolean;
    sortOrder?: number;
  }
): Promise<PropertyImageRecord> {
  const res = await fetch(`/api/admin/images/${encodeURIComponent(imageId)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  const data = await handleJson<{ image: PropertyImageRecord }>(res);
  return data.image;
}

export async function reorderAdminPropertyImages(
  token: string,
  propertyId: string,
  orderedIds: string[]
): Promise<PropertyImageRecord[]> {
  const res = await fetch(
    `/api/admin/properties/${encodeURIComponent(propertyId)}/images/reorder`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderedIds }),
    }
  );
  const data = await handleJson<{ images: PropertyImageRecord[] }>(res);
  return data.images;
}

export async function deleteAdminImage(token: string, imageId: string): Promise<void> {
  const res = await fetch(`/api/admin/images/${encodeURIComponent(imageId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleJson(res);
}

export async function fetchAdminMedia(
  token: string,
  search?: string
): Promise<MediaItemRecord[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`/api/admin/media${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await handleJson<{ media: MediaItemRecord[] }>(res);
  return data.media;
}

export async function fetchAdminInquiries(
  token: string,
  params?: { status?: string; search?: string }
): Promise<InquiryRecord[]> {
  const sp = new URLSearchParams();
  if (params?.status && params.status !== 'All') sp.set('status', params.status);
  if (params?.search) sp.set('search', params.search);
  const qs = sp.toString();
  const res = await fetch(`/api/admin/inquiries${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await handleJson<{ inquiries: InquiryRecord[] }>(res);
  return data.inquiries;
}

export async function updateAdminInquiryStatus(
  token: string,
  id: string,
  status: InquiryStatus
): Promise<InquiryRecord> {
  const res = await fetch(`/api/admin/inquiries/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  const data = await handleJson<{ inquiry: InquiryRecord }>(res);
  return data.inquiry;
}
