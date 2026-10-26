import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number, listingType?: string): string {
  if (!Number.isFinite(amount)) return '₹0';
  const suffix = listingType === 'Rent' ? ' / month' : '';

  if (amount >= 10000000) {
    const crores = amount / 10000000;
    const formatted = crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} Cr${suffix}`;
  }

  if (amount >= 100000) {
    const lakhs = amount / 100000;
    const formatted = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} Lakh${suffix}`;
  }

  return `₹${new Intl.NumberFormat('en-IN').format(amount)}${suffix}`;
}

export function formatFullINR(amount: number): string {
  return `₹${new Intl.NumberFormat('en-IN').format(amount)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
