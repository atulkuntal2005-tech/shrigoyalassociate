import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import {
  deleteAdminProperty,
  fetchAdminProperties,
  updateAdminProperty,
} from '../../lib/api';
import { PROPERTY_STATUSES, type PropertyRecord, type PropertyStatus } from '../../types';
import { formatINR } from '../../lib/utils';
import { SmartImage } from '../../components/SmartImage';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';

export function AdminPropertiesPage() {
  const { getAccessToken } = useAuth();
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Inline confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<PropertyRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Authentication required.');
      const items = await fetchAdminProperties(token);
      setProperties(items);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load properties.');
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.propertyType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [properties, search, statusFilter]);

  const handleQuickUpdate = async (
    prop: PropertyRecord,
    patch: { status?: PropertyStatus; featured?: boolean }
  ) => {
    setUpdatingId(prop.id);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Authentication required.');
      const updated = await updateAdminProperty(token, prop.id, {
        title: prop.title,
        slug: prop.slug,
        description: prop.description,
        location: prop.location,
        price: prop.price,
        propertyType: prop.propertyType,
        listingType: prop.listingType,
        status: patch.status ?? prop.status,
        area: prop.area,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        amenities: prop.amenities,
        features: prop.features,
        featured: patch.featured ?? prop.featured,
      });
      setProperties((prev) => prev.map((item) => (item.id === prop.id ? updated : item)));
      toast.success('Property updated cleanly.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update property.');
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Authentication required.');
      await deleteAdminProperty(token, deleteTarget.id);
      setProperties((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success(`Deleted "${deleteTarget.title}" and associated images.`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete property.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* SINGLE H1 ON ADMIN PROPERTIES PAGE */}
          <h1 className="font-display text-3xl font-semibold text-[#18181b]">
            Manage Properties
          </h1>
          <p className="text-sm text-stone-600">
            Create, edit, feature, change availability status, or remove property listings.
          </p>
        </div>

        <Link
          to="/admin/properties/new"
          className="inline-flex items-center justify-center gap-2 min-h-[42px] px-5 py-2.5 rounded-lg bg-[#9a7b3e] text-white text-sm font-medium hover:bg-[#7f632e] transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Add Property
        </Link>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
        <div className="relative flex-1 max-w-md">
          <Search
            className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, location, or type..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg overflow-x-auto">
          {(['All', ...PROPERTY_STATUSES] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-[#18181b] shadow-xs'
                  : 'text-stone-600 hover:text-[#18181b]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center space-y-3">
          <h2 className="font-display text-2xl font-semibold text-[#18181b]">
            No Matching Properties
          </h2>
          <p className="text-sm text-stone-500">
            Add a new property or clear your search filter.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-xs font-medium text-stone-500 bg-stone-50/70">
                <th className="py-3.5 px-4">Property</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {filtered.map((prop) => (
                <tr key={prop.id} className="hover:bg-stone-50/60">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3 min-w-[240px]">
                      <SmartImage
                        src={prop.coverImage}
                        alt={prop.title}
                        width={96}
                        height={72}
                        className="h-12 w-16 rounded-md object-cover shrink-0 border border-stone-200"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-[#18181b] truncate max-w-[260px]">
                          {prop.title}
                        </p>
                        <p className="text-xs text-stone-500 truncate max-w-[260px]">
                          {prop.location} · {prop.images?.length || 0} photos
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-stone-600">
                    {prop.propertyType} · {prop.listingType}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-medium tabular-nums whitespace-nowrap">
                    {formatINR(prop.price, prop.listingType)}
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      aria-label={`Change status for ${prop.title}`}
                      value={prop.status}
                      disabled={updatingId === prop.id}
                      onChange={(e) =>
                        handleQuickUpdate(prop, {
                          status: e.target.value as PropertyStatus,
                        })
                      }
                      className="rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-[#18181b] focus-visible:outline-none focus-visible:border-[#9a7b3e]"
                    >
                      {PROPERTY_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      disabled={updatingId === prop.id}
                      onClick={() =>
                        handleQuickUpdate(prop, { featured: !prop.featured })
                      }
                      aria-label={
                        prop.featured ? 'Remove from featured' : 'Mark as featured'
                      }
                      className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors cursor-pointer ${
                        prop.featured
                          ? 'text-[#9a7b3e] bg-[#f6f1e6]'
                          : 'text-stone-300 hover:text-stone-500'
                      }`}
                    >
                      <Star
                        className="h-4 w-4"
                        fill={prop.featured ? 'currentColor' : 'none'}
                      />
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {prop.status !== 'Draft' && (
                        <Link
                          to={`/properties/${prop.slug}`}
                          target="_blank"
                          aria-label={`View ${prop.title} on live site`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-stone-500 hover:bg-stone-100 hover:text-[#18181b]"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <Link
                        to={`/admin/properties/${prop.id}`}
                        aria-label={`Edit ${prop.title}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-stone-600 hover:bg-stone-100 hover:text-[#9a7b3e]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(prop)}
                        aria-label={`Delete ${prop.title}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-stone-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal for Deleting Property */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-prop-title"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-stone-200 p-6 space-y-4 shadow-xl">
            <h2
              id="delete-prop-title"
              className="font-display text-2xl font-semibold text-[#18181b]"
            >
              Delete Property Listing?
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong>{deleteTarget.title}</strong> and all{' '}
              <strong>{deleteTarget.images?.length || 0}</strong> associated property images? This action updates the public website immediately and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
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
                  'Delete Permanently'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
