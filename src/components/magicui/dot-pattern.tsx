'use client';

import { cn } from '@/lib/utils';

interface DotPatternProps {
  className?: string;
  cx?: number;
  cy?: number;
  cr?: number;
}

export function DotPattern({ className, cx = 1, cy = 1, cr = 1 }: DotPatternProps) {
  const id = 'dot-pattern';
  return (
    <svg
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full fill-current', className)}
    >
      <defs>
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
