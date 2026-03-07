'use client';

import { cn } from '@/lib/utils';

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
}

export function BorderBeam({
  className,
  size = 100,
  duration = 3,
  colorFrom = '#3b82f6',
  colorTo = '#8b5cf6',
}: BorderBeamProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent',
        '[mask-clip:padding-box,border-box] [mask-composite:intersect]',
        '[mask-image:linear-gradient(transparent,transparent),linear-gradient(white,white)]',
        className
      )}
      style={
        {
          '--size': size,
          '--duration': `${duration}s`,
          '--color-from': colorFrom,
          '--color-to': colorTo,
          background: `linear-gradient(white, white) padding-box, conic-gradient(from calc(var(--angle) * 1deg), var(--color-from), var(--color-to), var(--color-from)) border-box`,
          animation: `border-beam-rotate var(--duration) linear infinite`,
        } as React.CSSProperties
      }
    />
  );
}
