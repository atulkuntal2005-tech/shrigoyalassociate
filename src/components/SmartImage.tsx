import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SmartImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function SmartImage({
  src,
  alt,
  className,
  width = 800,
  height = 600,
  priority = false,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 via-[#f6f1e6] to-stone-200 text-stone-500 p-6 text-center select-none',
          className
        )}
      >
        <Building2 className="h-9 w-9 text-[#9a7b3e]/70 mb-2" aria-hidden="true" />
        <span className="text-xs font-medium text-stone-600 line-clamp-2 max-w-[220px]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  );
}
