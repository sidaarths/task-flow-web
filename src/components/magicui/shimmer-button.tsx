'use client';

import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  background?: string;
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = 'rgba(255,255,255,0.2)',
  background = 'rgb(37 99 235)',
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg',
        className
      )}
      style={{ background }}
      {...props}
    >
      {/* Shimmer sweep */}
      <span
        className="pointer-events-none absolute inset-0 translate-x-[-100%] skew-x-[-20deg] group-hover:animate-shimmer"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
        }}
      />
      {children}
    </button>
  );
}
