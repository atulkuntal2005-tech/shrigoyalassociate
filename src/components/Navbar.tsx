import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { BUSINESS_INFO } from '../lib/constants';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Properties', to: '/properties' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#faf9f6]/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single clean text wordmark */}
        <Link
          to="/"
          className="font-display text-2xl font-semibold tracking-tight text-[#18181b] whitespace-nowrap shrink-0"
        >
          {BUSINESS_INFO.companyName}
        </Link>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
                  isActive
                    ? 'border-[#9a7b3e] text-[#18181b]'
                    : 'border-transparent hover:text-[#18181b] hover:border-stone-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/properties"
            className="hidden sm:inline-flex items-center justify-center min-h-[40px] px-5 py-2 rounded-lg text-sm font-medium bg-[#18181b] text-white hover:bg-[#9a7b3e] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            Explore Properties
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center h-11 w-11 rounded-lg border border-stone-200 text-[#18181b] hover:bg-stone-100 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-stone-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-[#f6f1e6] text-[#18181b]'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="pt-2">
            <Link
              to="/properties"
              className="flex w-full items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-medium bg-[#18181b] text-white hover:bg-[#9a7b3e] transition-colors"
            >
              Explore Properties
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
