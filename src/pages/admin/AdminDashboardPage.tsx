import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchAdminDashboard,
  triggerSitemapVerification,
  type DashboardResponse,
} from '../../lib/api';
import { formatDate, formatINR } from '../../lib/utils';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';

export function AdminDashboardPage() {
  const { getAccessToken } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyingSitemap, setVerifyingSitemap] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) throw new Error('Authentication required.');
        const res = await fetchAdminDashboard(token);
        if (active) {
          setData(res);
          setError(null);
        }
      } catch (err: any) {
        if (active) setError(err?.message || 'Failed to load dashboard overview.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [getAccessToken]);

  const handleSitemapSubmit = async () => {
    setVerifyingSitemap(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Session expired.');
      const res = await triggerSitemapVerification(token);
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to verify sitemap.');
    } finally {
      setVerifyingSitemap(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {error || 'Unable to load dashboard.'}
      </div>
    );
  }

  const statItems = [
    { label: 'Total Properties', value: data.totalProperties },
    { label: 'Available', value: data.availableProperties },
    { label: 'Sold Properties', value: data.soldProperties },
    { label: 'Rental Properties', value: data.rentalProperties },
    { label: 'Featured', value: data.featuredProperties },
    { label: 'Total Inquiries', value: data.totalInquiries },
    { label: 'New Inquiries', value: data.newInquiries, highlight: data.newInquiries > 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* SINGLE H1 ON ADMIN DASHBOARD PAGE */}
          <h1 className="font-display text-3xl font-semibold text-[#18181b]">
            Executive Dashboard
          </h1>
          <p className="text-sm text-stone-600">
            Live portfolio metrics, recent listings, and client inquiries for Shri Goyal Associate.
          </p>
        </div>

        <Link
          to="/admin/properties/new"
          className="inline-flex items-center justify-center gap-2 min-h-[42px] px-5 py-2.5 rounded-lg bg-[#9a7b3e] text-white text-sm font-medium hover:bg-[#7f632e] transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add New Property
        </Link>
      </div>

      {/* 7 Dynamic KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-stone-200 bg-white p-4 flex flex-col justify-between"
          >
            <p className="text-xs font-medium text-stone-500">{stat.label}</p>
            <p
              className={`font-mono text-2xl font-semibold tabular-nums mt-2 ${
                stat.highlight ? 'text-[#9a7b3e]' : 'text-[#18181b]'
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Properties & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Properties */}
        <section className="rounded-xl border border-stone-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-[#18181b]">
              Recent Properties
            </h2>
            <Link
              to="/admin/properties"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#9a7b3e] hover:underline"
            >
              Manage All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {data.recentProperties.length === 0 ? (
            <div className="p-8 text-center text-sm text-stone-500">
              No properties added yet.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {data.recentProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-stone-50/70"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/admin/properties/${prop.id}`}
                      className="text-sm font-medium text-[#18181b] hover:text-[#9a7b3e] truncate block"
                    >
                      {prop.title}
                    </Link>
                    <p className="text-xs text-stone-500 truncate">
                      {prop.propertyType} · {prop.status} · {prop.location}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-xs font-semibold text-[#18181b] tabular-nums">
                      {formatINR(prop.price, prop.listingType)}
                    </p>
                    <Link
                      to={`/admin/properties/${prop.id}`}
                      className="text-xs text-[#9a7b3e] hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Inquiries */}
        <section className="rounded-xl border border-stone-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-[#18181b]">
              Recent Client Inquiries
            </h2>
            <Link
              to="/admin/inquiries"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#9a7b3e] hover:underline"
            >
              View All Leads
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {data.recentInquiries.length === 0 ? (
            <div className="p-8 text-center text-sm text-stone-500">
              No inquiries received yet.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {data.recentInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="px-6 py-3.5 flex items-start justify-between gap-4 hover:bg-stone-50/70"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium text-[#18181b] truncate">
                      {inq.name}{' '}
                      <span className="font-mono text-xs font-normal text-stone-500 tabular-nums">
                        · {inq.phone}
                      </span>
                    </p>
                    <p className="text-xs text-stone-600 line-clamp-1">{inq.message}</p>
                    {inq.propertyTitle && (
                      <p className="text-xs text-[#9a7b3e] truncate">
                        Property: {inq.propertyTitle}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <span
                      className={`text-xs font-medium ${
                        inq.status === 'New'
                          ? 'text-amber-700'
                          : inq.status === 'Contacted'
                          ? 'text-blue-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {inq.status}
                    </span>
                    <p className="font-mono text-[11px] text-stone-400 tabular-nums">
                      {formatDate(inq.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Domain SEO, Search Console & .in Sitemap Indexation Panel */}
      <section className="rounded-xl border border-stone-200 bg-white p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            <span>Search Console Verified &amp; HTTPS Enforced (.in Domain)</span>
          </div>
          <h2 className="font-display text-xl font-semibold text-[#18181b]">
            Sitemap &amp; Search Indexing ({data.seo.domain})
          </h2>
          <p className="text-xs text-stone-600">
            Dynamic XML sitemap currently indexes{' '}
            <strong className="font-mono tabular-nums">{data.seo.indexedUrlsCount}</strong>{' '}
            canonical public URLs and automatically updates when properties are published or modified.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#9a7b3e] hover:underline"
            >
              Inspect /sitemap.xml
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#9a7b3e] hover:underline"
            >
              Inspect /robots.txt
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={verifyingSitemap}
          onClick={handleSitemapSubmit}
        >
          {verifyingSitemap ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing Sitemap...
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 text-[#9a7b3e]" />
              Verify &amp; Submit Updated Sitemap
            </>
          )}
        </Button>
      </section>
    </div>
  );
}
