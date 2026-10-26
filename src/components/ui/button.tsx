import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a7b3e] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#18181b] text-white hover:bg-[#27272a]',
        gold: 'bg-[#9a7b3e] text-white hover:bg-[#7f632e]',
        outline:
          'border border-stone-300 bg-white text-[#18181b] hover:bg-stone-50 hover:border-stone-400',
        ghost: 'text-stone-700 hover:bg-stone-100 hover:text-[#18181b]',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        whatsapp: 'bg-[#15803d] text-white hover:bg-[#166534]',
      },
      size: {
        default: 'min-h-[42px] px-5 py-2.5',
        sm: 'min-h-[36px] px-3.5 py-1.5 text-xs',
        lg: 'min-h-[48px] px-7 py-3 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
export { buttonVariants };
