-- =============================================================================
-- Shri Goyal Associate – Complete PostgreSQL / Supabase Schema, Storage & RLS
-- Owners: Jitendra Goyal & Hemant Goyal | Mathura, Uttar Pradesh – 281004
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) >= 3),
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  price BIGINT NOT NULL CHECK (price > 0),
  property_type TEXT NOT NULL CHECK (
    property_type IN (
      'Residential',
      'Commercial',
      'Plot',
      'Villa',
      'Apartment',
      'House',
      'Shop',
      'Office',
      'Land'
    )
  ),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('Sale', 'Rent')),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (
    status IN ('Available', 'Sold', 'Rented', 'Draft')
  ),
  area INTEGER NOT NULL CHECK (area > 0),
  bedrooms INTEGER NOT NULL DEFAULT 0 CHECK (bedrooms >= 0),
  bathrooms INTEGER NOT NULL DEFAULT 0 CHECK (bathrooms >= 0),
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Property Images Table
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  alt_text TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Inquiries Table
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2),
  phone TEXT NOT NULL CHECK (char_length(trim(phone)) >= 10),
  email TEXT NOT NULL CHECK (position('@' in email) > 1),
  message TEXT NOT NULL CHECK (char_length(trim(message)) >= 10),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'New' CHECK (
    status IN ('New', 'Contacted', 'Closed')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(location);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_is_cover ON public.property_images(is_cover);
CREATE INDEX IF NOT EXISTS idx_property_images_sort_order ON public.property_images(sort_order);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON public.inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- 5. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_properties_updated_at ON public.properties;
CREATE TRIGGER set_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Enable Row Level Security (NEVER disabled)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for properties
-- Public users can read published (non-Draft) properties
CREATE POLICY "Public users can view published properties"
  ON public.properties
  FOR SELECT
  TO anon, authenticated
  USING (status <> 'Draft' OR auth.role() = 'authenticated');

-- Authenticated admins can create, update, and delete properties
CREATE POLICY "Admins can insert properties"
  ON public.properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update properties"
  ON public.properties
  FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete properties"
  ON public.properties
  FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- 8. RLS Policies for property_images
-- Public users can read property images belonging to non-Draft properties
CREATE POLICY "Public users can view property images"
  ON public.property_images
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.properties p
      WHERE p.id = property_images.property_id
        AND (p.status <> 'Draft' OR auth.role() = 'authenticated')
    )
  );

CREATE POLICY "Admins can insert property images"
  ON public.property_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update property images"
  ON public.property_images
  FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete property images"
  ON public.property_images
  FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- 9. RLS Policies for inquiries
-- Public users can submit inquiries
CREATE POLICY "Public users can submit inquiries"
  ON public.inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'New');

-- Authenticated admins can view and update inquiries
CREATE POLICY "Admins can view inquiries"
  ON public.inquiries
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update inquiry status"
  ON public.inquiries
  FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 10. Supabase Storage Bucket & Policies (property-images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for property-images bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated admins can upload to property-images bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Authenticated admins can update property-images bucket"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-images')
  WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Authenticated admins can delete from property-images bucket"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images');
