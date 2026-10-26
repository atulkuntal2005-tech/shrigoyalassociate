import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Mail, MessageCircle, Phone, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAdminInquiries, updateAdminInquiryStatus } from '../../lib/api';
import {
  INQUIRY_STATUSES,
  type InquiryRecord,
  type InquiryStatus,
} from '../../types';
import { formatDate } from '../../lib/utils';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';

export function AdminInquiriesPage() {
  const { getAccessToken } = useAuth();
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Authentication required.');
      const list = await fetchAdminInquiries(token, {
        status: statusFilter,
        search,
      });
      setInquiries(list);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadInquiries();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadInquiries]);

  const handleStatusChange = async (id: string, nextStatus: InquiryStatus) => {
    setUpdatingId(id);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Authentication required.');
      const updated = await updateAdminInquiryStatus(token, id, nextStatus);
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: updated.status } : item
        )
      );
      toast.success(`Inquiry marked as ${nextStatus}.`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update inquiry status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        {/* SINGLE H1 ON ADMIN INQUIRIES PAGE */}
        <h1 className="font-display text-3xl font-semibold text-[#18181b]">
          Client Inquiries &amp; Leads
        </h1>
        <p className="text-sm text-stone-600">
          Review website property inquiries, contact prospective buyers directly, and track follow-up status.
        </p>
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
            placeholder="Search by client name, phone, email, message, or property..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg overflow-x-auto">
          {(['All', ...INQUIRY_STATUSES] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
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

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center space-y-2">
          <h2 className="font-display text-2xl font-semibold text-[#18181b]">
            No Inquiries Found
          </h2>
          <p className="text-sm text-stone-500">
            New property and contact form submissions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-xs font-medium text-stone-500">
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Property &amp; Message</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm align-top">
              {inquiries.map((inq) => {
                const cleanDigits = inq.phone.replace(/[^0-9]/g, '');
                const waPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;

                return (
                  <tr key={inq.id} className="hover:bg-stone-50/60">
                    <td className="py-4 px-4 font-medium text-[#18181b] whitespace-nowrap">
                      {inq.name}
                    </td>

                    <td className="py-4 px-4 space-y-1.5 whitespace-nowrap">
                      <p className="font-mono text-xs text-stone-700 tabular-nums">
                        {inq.phone}
                      </p>
                      <p className="text-xs text-stone-500">{inq.email}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${inq.phone}`}
                          aria-label={`Call ${inq.name}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#18181b] hover:text-[#9a7b3e]"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Call
                        </a>
                        <span className="text-stone-300">·</span>
                        <a
                          href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                            `Hello ${inq.name}, greetings from Shri Goyal Associate regarding your property inquiry.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#15803d] hover:underline"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </a>
                        <span className="text-stone-300">·</span>
                        <a
                          href={`mailto:${inq.email}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-[#9a7b3e]"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Email
                        </a>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-md space-y-1.5">
                      {inq.propertyTitle ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-[#9a7b3e]">
                          <span>{inq.propertyTitle}</span>
                          {inq.propertySlug && (
                            <Link
                              to={`/properties/${inq.propertySlug}`}
                              target="_blank"
                              aria-label="Open property page"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400">General Consultation</span>
                      )}
                      <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap">
                        {inq.message}
                      </p>
                    </td>

                    <td className="py-4 px-4 font-mono text-xs text-stone-500 tabular-nums whitespace-nowrap">
                      {formatDate(inq.createdAt)}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <select
                        aria-label={`Status for inquiry from ${inq.name}`}
                        value={inq.status}
                        disabled={updatingId === inq.id}
                        onChange={(e) =>
                          handleStatusChange(inq.id, e.target.value as InquiryStatus)
                        }
                        className="rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-[#18181b] focus-visible:outline-none focus-visible:border-[#9a7b3e]"
                      >
                        {INQUIRY_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
