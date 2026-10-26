import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Expand, ExternalLink, Loader2, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { deleteAdminImage, fetchAdminMedia } from '../../lib/api';
import type { MediaItemRecord } from '../../types';
import { formatDate } from '../../lib/utils';
import { SmartImage } from '../../components/SmartImage';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

export function AdminMediaPage() {
  const { getAccessToken } = useAuth();
  const [media, setMedia] = useState<MediaItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [previewItem, setPreviewItem] = useState<MediaItemRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItemRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Authentication required.');
      const list = await fetchAdminMedia(token, search);
      setMedia(list);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load media library.');
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMedia();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadMedia]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Authentication required.');
      await deleteAdminImage(token, deleteTarget.id);
      setMedia((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      toast.success('Deleted image from media library.');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete media item.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* SINGLE H1 ON ADMIN MEDIA PAGE */}
          <h1 className="font-display text-3xl font-semibold text-[#18181b]">
            Media Library
          </h1>
          <p className="text-sm text-stone-600">
            Browse, preview, search, and manage all uploaded property photography and associated listings.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by associated property, caption, alt text, or path..."
            className="pl-9"
          />
        </div>
        <p className="text-xs font-mono text-stone-500 tabular-nums">
          {media.length} {media.length === 1 ? 'asset' : 'assets'}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center space-y-2">
          <h2 className="font-display text-2xl font-semibold text-[#18181b]">
            No Media Assets Found
          </h2>
          <p className="text-sm text-stone-500">
            Upload images while creating or editing a property to view them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {media.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-stone-200 bg-white overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] bg-stone-100 group">
                <SmartImage
                  src={item.publicUrl}
                  alt={item.altText || item.caption || 'Property image'}
                  width={480}
                  height={360}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPreviewItem(item)}
                  aria-label="Preview full size"
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-black/75 px-3 py-1.5 text-xs font-medium text-white hover:bg-black cursor-pointer"
                >
                  <Expand className="h-3.5 w-3.5" />
                  Preview
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#9a7b3e] truncate">
                    {item.propertyTitle ? (
                      <Link
                        to={`/admin/properties/${item.propertyId}`}
                        className="hover:underline inline-flex items-center gap-1"
                      >
                        {item.propertyTitle}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </Link>
                    ) : (
                      'Unassigned Property'
                    )}
                  </p>
                  <p className="text-xs text-[#18181b] font-medium line-clamp-2">
                    {item.caption || item.altText || item.storagePath}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="font-mono tabular-nums">
                    {formatDate(item.createdAt)}
                    {item.isCover ? ' · Cover' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    aria-label="Delete media asset"
                    className="inline-flex items-center gap-1 text-red-600 hover:underline cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Preview Lightbox */}
      {previewItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
        >
          <div className="w-full max-w-4xl flex items-center justify-between text-white mb-3">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {previewItem.propertyTitle || 'Property Media'}
              </p>
              <p className="text-xs text-stone-400 truncate">
                Alt: {previewItem.altText || 'N/A'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              aria-label="Close preview"
              className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <img
            src={previewItem.publicUrl}
            alt={previewItem.altText || 'Preview'}
            referrerPolicy="no-referrer"
            className="max-h-[78vh] max-w-full rounded-lg object-contain"
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-stone-200 p-6 space-y-4 shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-[#18181b]">
              Delete Media Image?
            </h2>
            <p className="text-sm text-stone-600">
              Permanently delete this image from storage and remove it from{' '}
              <strong>{deleteTarget.propertyTitle || 'its associated property'}</strong>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleting}
                onClick={confirmDelete}
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Image'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
