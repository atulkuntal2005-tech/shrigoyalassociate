import React from 'react';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '../lib/constants';

export function FloatingWhatsApp() {
  return (
    <a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Shri Goyal Associate on WhatsApp (9720241212)"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 rounded-full bg-[#15803d] px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-[#166534] transition-transform duration-150 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d] focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline whitespace-nowrap">WhatsApp Us</span>
    </a>
  );
}
