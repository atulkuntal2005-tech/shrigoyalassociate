import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ImagePlus,
  Loader2,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import {
  createAdminProperty,
  deleteAdminImage,
  fetchAdminPropertyById,
  reorderAdminPropertyImages,
  updateAdminImageMetadata,
  updateAdminProperty,
  uploadAdminPropertyImages,
} from '../../lib/api';
import {
  LISTING_TYPES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  type PropertyImageRecord,
} from '../../types';
import { propertyFormSchema, type PropertyFormValues } from '../../lib/validations';
import { slugify } from '../../lib/utils';
import { SmartImage } from '../../components/SmartImage';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';

interface QueuedFile {
  file: File;
  previewUrl: string;
}

export function AdminPropertyFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { getAccessToken } = useAuth();

  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [images, setImages] = useState<PropertyImageRecord[]>([]);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [savingImageId, setSavingImageId] = useState<string | null>(null);
  const [deleteImageTarget, setDeleteImageTarget] = useState<PropertyImageRecord | null>(
    null
  );

  // Dynamic array builders for Amenities & Features
  const [amenityInput, setAmenityInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      location: '',
      price: 5000000,
      propertyType: 'Residential',
      listingType: 'Sale',
      status: 'Available',
      area: 1500,
      bedrooms: 3,
      bathrooms: 2,
      amenities: [],
      features: [],
      featured: false,
    },
  });

  const amenities = watch('amenities') || [];
  const features = watch('features') || [];
  const watchedTitle = watch('title');

  useEffect(() => {
    if (!isEdit || !id) return;
    let active = true;
    (async () => {
      setLoadingInitial(true);
      try {
        const token = await getAccessToken();
        if (!token) throw new Error('Authentication required.');
        const prop = await fetchAdminPropertyById(token, id);
        if (!active) return;
        reset({
          title: prop.title,
          slug: prop.slug,
          description: prop.description,
          location: prop.location,
          price: prop.price,
          propertyType: prop.propertyType,
          listingType: prop.listingType,
          status: prop.status,
          area: prop.area,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          amenities: prop.amenities,
          features: prop.features,
          featured: prop.featured,
        });
        setImages(prop.images || []);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to load property details.');
        navigate('/admin/properties');
      } finally {
        if (active) setLoadingInitial(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isEdit, getAccessToken, reset, navigate]);

  const handleAutoSlug = () => {
    if (watchedTitle) {
      setValue('slug', slugify(watchedTitle), { shouldValidate: true });
    }
  };

  const addAmenity = () => {
    const val = amenityInput.trim();
    if (!val) return;
    if (!amenities.includes(val)) {
      setValue('amenities', [...amenities, val]);
    }
    setAmenityInput('');
  };

  const removeAmenity = (target: string) => {
    setValue(
      'amenities',
      amenities.filter((a) => a !== target)
    );
  };

  const addFeature = () => {
    const val = featureInput.trim();
    if (!val) return;
    if (!features.includes(val)) {
      setValue('features', [...features, val]);
    }
    setFeatureInput('');
  };

  const removeFeature = (target: string) => {
    setValue(
      'features',
      features.filter((f) => f !== target)
    );
  };

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const filesArray = Array.from(fileList);

    if (isEdit && id) {
      setUploadingImages(true);
      try {
        const token = await getAccessToken();
        if (!token) throw new Error('Authentication required.');
        const newlySaved = await uploadAdminPropertyImages(
          token,
          id,
          filesArray,
          uploadCaption,
          uploadAlt
        );
        setImages((prev) => [...prev, ...newlySaved]);
        setUploadCaption('');
        setUploadAlt('');
        toast.success(
          `Uploaded ${newlySaved.length} ${
            newlySaved.length === 1 ? 'image' : 'images'
          } to property-images bucket.`
        );
      } catch (err: any) {
        toast.error(err?.message || 'Image upload failed.');
      } finally {
        setUploadingImages(false);
        e.target.value = '';
      }
    } else {
      const nextQueued = filesArray.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setQueuedFiles((prev) => [...prev, ...nextQueued]);
      e.target.value = '';
    }
  };

  const removeQueuedFile = (idx: number) => {
    setQueuedFiles((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  };

  const handleSetCover = async (img: PropertyImageRecord) => {
    setSavingImageId(img.id);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Authentication required.');
      await updateAdminImageMetadata(token, img.id, { isCover: true });
      setImages((prev) =>
        prev.map((item) => ({
          ...item,
          isCover: item.id === img.id,
        }))
      );
      toast.success('Updated property cover image.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to set cover image.');
    } finally {
      setSavingImageId(null);
    }
  };

  const handleSaveCaptionAlt = async (
    imgId: string,
    caption: string,
    altText: string
  ) => {
    setSavingImageId(imgId);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Authentication required.');
      const updated = await updateAdminImageMetadata(token, imgId, {
        caption,
        altText,
      });
      setImages((prev) => prev.map((item) => (item.id === imgId ? updated : item)));
      toast.success('Saved image caption and SEO alt text.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save image metadata.');
    } finally {
      setSavingImageId(null);
    }
  };

  const handleMoveImage = async (index: number, direction: -1 | 1) => {
    if (!id) return;
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    setImages(reordered);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Authentication required.');
      const persisted = await reorderAdminPropertyImages(
        token,
        id,
        reordered.map((i) => i.id)
      );
      setImages(persisted);
      toast.success('Image gallery order updated.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reorder images.');
    }
  };

  const confirmDeleteImage = async () => {
    if (!deleteImageTarget) return;
    setSavingImageId(deleteImageTarget.id);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Authentication required.');
      await deleteAdminImage(token, deleteImageTarget.id);
      setImages((prev) => prev.filter((i) => i.id !== deleteImageTarget.id));
      toast.success('Deleted image from storage and property gallery.');
      setDeleteImageTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete image.');
    } finally {
      setSavingImageId(null);
    }
  };

  const onSubmit = async (values: PropertyFormValues) => {
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Authentication required.');

      if (isEdit && id) {
        await updateAdminProperty(token, id, values);
        toast.success('Property changes published cleanly.');
        navigate('/admin/properties');
      } else {
        const created = await createAdminProperty(token, values);
        if (queuedFiles.length > 0) {
          await uploadAdminPropertyImages(
            token,
            created.id,
            queuedFiles.map((q) => q.file),
            uploadCaption,
            uploadAlt || `${created.title} – ${created.location}`
          );
        }
        toast.success('New property created and published.');
        navigate(`/admin/properties/${created.id}`);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save property.');
    }
  };

  if (loadingInitial) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/properties"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-[#9a7b3e] mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Properties
          </Link>
          {/* SINGLE H1 ON ADMIN PROPERTY FORM PAGE */}
          <h1 className="font-display text-3xl font-semibold text-[#18181b]">
            {isEdit ? 'Edit Property Listing' : 'Create New Property Listing'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Core Details */}
        <section className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8 space-y-6">
          <h2 className="font-display text-2xl font-semibold text-[#18181b]">
            Property Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="prop-title">Property Title *</Label>
              <Input
                id="prop-title"
                placeholder="e.g. 4 BHK Sandstone Villa on Chhatikara Road"
                {...register('title')}
                onBlur={() => {
                  if (!isEdit && !watch('slug')) handleAutoSlug();
                }}
              />
              {errors.title && (
                <p className="text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="prop-slug">URL Slug (.in SEO Path)</Label>
                <button
                  type="button"
                  onClick={handleAutoSlug}
                  className="text-xs text-[#9a7b3e] hover:underline cursor-pointer"
                >
                  Generate from Title
                </button>
              </div>
              <Input
                id="prop-slug"
                placeholder="auto-generated-from-title"
                {...register('slug')}
              />
              {errors.slug && (
                <p className="text-xs text-red-600">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prop-location">Location / Locality *</Label>
              <Input
                id="prop-location"
                placeholder="e.g. Near Shree Ram Sonk Road, Mandi Choraha, Mathura"
                {...register('location')}
              />
              {errors.location && (
                <p className="text-xs text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prop-price">Price in INR (₹) *</Label>
              <Input
                id="prop-price"
                type="number"
                min={1}
                step={1}
                {...register('price')}
              />
              {errors.price && (
                <p className="text-xs text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1 lg:col-span-2">
              <Label htmlFor="prop-type">Property Type *</Label>
              <select
                id="prop-type"
                {...register('propertyType')}
                className="flex min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prop-listing">Listing Type *</Label>
              <select
                id="prop-listing"
                {...register('listingType')}
                className="flex min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              >
                {LISTING_TYPES.map((lt) => (
                  <option key={lt} value={lt}>
                    {lt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prop-status">Status *</Label>
              <select
                id="prop-status"
                {...register('status')}
                className="flex min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              >
                {PROPERTY_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prop-area">Area (sq.ft) *</Label>
              <Input id="prop-area" type="number" min={1} {...register('area')} />
              {errors.area && (
                <p className="text-xs text-red-600">{errors.area.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prop-beds">Bedrooms</Label>
              <Input id="prop-beds" type="number" min={0} {...register('bedrooms')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prop-baths">Bathrooms</Label>
              <Input id="prop-baths" type="number" min={0} {...register('bathrooms')} />
            </div>

            <div className="col-span-2 sm:col-span-2 lg:col-span-4 flex items-center gap-3 pt-4">
              <input
                id="prop-featured"
                type="checkbox"
                {...register('featured')}
                className="h-4 w-4 rounded border-stone-300 accent-[#9a7b3e]"
              />
              <Label htmlFor="prop-featured" className="cursor-pointer">
                Highlight in Featured Properties on Home Page
              </Label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prop-desc">Detailed Description *</Label>
            <Textarea
              id="prop-desc"
              rows={5}
              placeholder="Describe architectural highlights, road width, MVDA/freehold title status, nearby landmarks..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>
        </section>

        {/* Amenities & Features */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold text-[#18181b]">
              Amenities
            </h2>
            <div className="flex gap-2">
              <Input
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
                placeholder="e.g. 24x7 Gated Security"
              />
              <Button type="button" variant="outline" onClick={addAmenity}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            {amenities.length > 0 && (
              <ul className="space-y-2">
                {amenities.map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2 text-xs text-stone-700"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeAmenity(item)}
                      className="text-stone-400 hover:text-red-600 cursor-pointer"
                      aria-label={`Remove ${item}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold text-[#18181b]">
              Key Features &amp; Title Highlights
            </h2>
            <div className="flex gap-2">
              <Input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                placeholder="e.g. MVDA Approved Freehold Registry"
              />
              <Button type="button" variant="outline" onClick={addFeature}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            {features.length > 0 && (
              <ul className="space-y-2">
                {features.map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2 text-xs text-stone-700"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(item)}
                      className="text-stone-400 hover:text-red-600 cursor-pointer"
                      aria-label={`Remove ${item}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Image Upload & Gallery Management (property-images bucket) */}
        <section className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#18181b]">
              Property Images (Bucket: property-images)
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Upload single or multiple images, assign cover image, reorder gallery sequence, and configure SEO alt text &amp; captions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="upload-caption">Default Caption for Next Upload</Label>
              <Input
                id="upload-caption"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="e.g. Front architectural elevation"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="upload-alt">Default SEO Alt Text for Next Upload</Label>
              <Input
                id="upload-alt"
                value={uploadAlt}
                onChange={(e) => setUploadAlt(e.target.value)}
                placeholder="e.g. 4 BHK Villa for Sale in Mathura"
              />
            </div>
          </div>

          <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-[#faf9f6] p-8 text-center hover:border-[#9a7b3e] transition-colors cursor-pointer">
            {uploadingImages ? (
              <div className="flex items-center gap-2 text-sm font-medium text-[#9a7b3e]">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Uploading to property-images storage...</span>
              </div>
            ) : (
              <>
                <ImagePlus className="h-8 w-8 text-[#9a7b3e] mb-2" />
                <span className="text-sm font-medium text-[#18181b]">
                  Click to Select One or Multiple Images
                </span>
                <span className="text-xs text-stone-500 mt-1">
                  Supports JPG, PNG, WebP, AVIF (up to 10 MB per photo)
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              disabled={uploadingImages}
              onChange={handleFileSelection}
              className="sr-only"
            />
          </label>

          {/* Queued files when creating a brand new property */}
          {!isEdit && queuedFiles.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-stone-600">
                {queuedFiles.length} image(s) queued — will upload automatically when you click Create Property:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {queuedFiles.map((qf, idx) => (
                  <div
                    key={qf.previewUrl}
                    className="relative rounded-lg overflow-hidden border border-stone-200 bg-stone-50"
                  >
                    <img
                      src={qf.previewUrl}
                      alt={qf.file.name}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeQueuedFile(idx)}
                      aria-label="Remove queued image"
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 text-white flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Uploaded Images Manager */}
          {isEdit && images.length > 0 && (
            <div className="space-y-4">
              {images.map((img, idx) => (
                <ImageEditorRow
                  key={img.id}
                  img={img}
                  index={idx}
                  total={images.length}
                  busy={savingImageId === img.id}
                  onSetCover={() => handleSetCover(img)}
                  onMoveUp={() => handleMoveImage(idx, -1)}
                  onMoveDown={() => handleMoveImage(idx, 1)}
                  onSaveMeta={(caption, altText) =>
                    handleSaveCaptionAlt(img.id, caption, altText)
                  }
                  onDelete={() => setDeleteImageTarget(img)}
                />
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link
            to="/admin/properties"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg border border-stone-300 bg-white text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </Link>
          <Button type="submit" variant="gold" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Property...
              </>
            ) : isEdit ? (
              'Update Property'
            ) : (
              'Create Property'
            )}
          </Button>
        </div>
      </form>

      {/* Confirm Image Deletion Modal */}
      {deleteImageTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-stone-200 p-6 space-y-4 shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-[#18181b]">
              Remove Property Image?
            </h2>
            <p className="text-sm text-stone-600">
              This image will be permanently removed from storage and the public property gallery.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteImageTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={savingImageId === deleteImageTarget.id}
                onClick={confirmDeleteImage}
              >
                Delete Image
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ImageEditorRow({
  img,
  index,
  total,
  busy,
  onSetCover,
  onMoveUp,
  onMoveDown,
  onSaveMeta,
  onDelete,
}: {
  img: PropertyImageRecord;
  index: number;
  total: number;
  busy: boolean;
  onSetCover: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSaveMeta: (caption: string, altText: string) => void;
  onDelete: () => void;
}) {
  const [caption, setCaption] = useState(img.caption);
  const [altText, setAltText] = useState(img.altText);

  return (
    <div className="rounded-xl border border-stone-200 bg-[#faf9f6] p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      <div className="md:col-span-3">
        <SmartImage
          src={img.publicUrl}
          alt={img.altText || 'Property image'}
          width={320}
          height={240}
          className="aspect-[4/3] w-full rounded-lg object-cover border border-stone-200"
        />
      </div>

      <div className="md:col-span-6 space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="font-mono tabular-nums">Order #{index + 1}</span>
          {img.isCover && (
            <span className="text-[#9a7b3e] font-semibold">· Cover Image</span>
          )}
        </div>
        <Input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (displayed under gallery)"
        />
        <Input
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="SEO Alt Text (required for accessibility & Google Images)"
        />
      </div>

      <div className="md:col-span-3 flex flex-wrap md:flex-col items-stretch justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => onSaveMeta(caption, altText)}
        >
          <Check className="h-3.5 w-3.5" />
          Save Text
        </Button>

        {!img.isCover && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={onSetCover}
          >
            <Star className="h-3.5 w-3.5 text-[#9a7b3e]" />
            Set Cover
          </Button>
        )}

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={index === 0 || busy}
            onClick={onMoveUp}
            className="flex-1"
            aria-label="Move image earlier"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={index === total - 1 || busy}
            onClick={onMoveDown}
            className="flex-1"
            aria-label="Move image later"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={onDelete}
            className="text-red-600 hover:bg-red-50"
            aria-label="Delete image"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
