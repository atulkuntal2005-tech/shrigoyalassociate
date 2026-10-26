import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-[#18181b] placeholder:text-stone-400 transition-colors focus-visible:outline-none focus-visible:border-[#9a7b3e] focus-visible:ring-2 focus-visible:ring-[#9a7b3e]/20 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
