import React, { useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  Building2,
  ExternalLink,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  PlusCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BUSINESS_INFO } from '../../lib/constants';
import { SEOHead } from '../SEOHead';

const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Properties', to: '/admin/properties', icon: Building2 },
  { label: 'Add Property', to: '/admin/properties/new', icon: PlusCircle },
  { label: 'Inquiries', to: '/admin/inquiries', icon: MessageSquare },
  { label: 'Media Library', to: '/admin/media', icon: ImageIcon },
];

export function AdminLayout() {
  const { user, loading, signOutUser } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="flex items-center gap-3 text-sm font-medium text-stone-600">
          <Loader2 className="h-5 w-5 animate-spin text-[#9a7b3e]" />
          <span>Verifying Admin Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  const currentBreadcrumb =
    ADMIN_NAV.find((item) => location.pathname === item.to)?.label ||
    (location.pathname.startsWith('/admin/properties/') ? 'Edit Property' : 'Overview');

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#18181b]">
      <SEOHead
        title={`Admin – ${currentBreadcrumb} | Shri Goyal Associate`}
        description="Shri Goyal Associate Admin CMS"
        noIndex
      />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#18181b] text-stone-300 border-r border-stone-800">
        <div className="h-16 px-6 flex items-center border-b border-stone-800">
          <Link
            to="/admin/dashboard"
            className="font-display text-xl font-semibold text-white truncate"
          >
            {BUSINESS_INFO.companyName}
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin/properties'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#9a7b3e] text-white'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-800 space-y-3">
          <div className="px-2">
            <p className="text-xs text-stone-500">Signed in as</p>
            <p className="text-xs font-medium text-stone-200 truncate">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => signOutUser()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-300 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-64 max-w-[80vw] bg-[#18181b] text-stone-300 flex flex-col">
            <div className="h-16 px-5 flex items-center justify-between border-b border-stone-800">
              <span className="font-display text-lg font-semibold text-white">
                Admin CMS
              </span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
                className="text-stone-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {ADMIN_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin/properties'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                        isActive
                          ? 'bg-[#9a7b3e] text-white'
                          : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="p-4 border-t border-stone-800">
              <button
                type="button"
                onClick={() => signOutUser()}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-stone-300 hover:bg-stone-800"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-stone-200 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin navigation"
              className="lg:hidden h-10 w-10 rounded-lg border border-stone-200 flex items-center justify-center text-stone-700"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-sm text-stone-500 truncate">
              <span>Admin CMS</span>
              <span className="mx-2" aria-hidden="true">/</span>
              <span className="font-medium text-[#18181b]">{currentBreadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 hover:border-[#9a7b3e] hover:text-[#18181b] transition-colors whitespace-nowrap"
            >
              View Live Website
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
