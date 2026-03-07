'use client';

import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

export function MagicCard({
  children,
  className,
  gradientSize = 160,
  gradientColor = '#3b82f6',
  gradientOpacity = 0.025,
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const card = cardRef.current;
    const gradient = gradientRef.current;
    if (!card || !gradient) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    gradient.style.background = `radial-gradient(${gradientSize}px circle at ${x}px ${y}px, ${gradientColor}, transparent 80%)`;
    gradient.style.opacity = String(Math.min(gradientOpacity * 10, 1));
  }, [gradientSize, gradientColor, gradientOpacity]);

  const handleMouseLeave = useCallback(() => {
    const gradient = gradientRef.current;
    if (gradient) gradient.style.opacity = '0';
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <div ref={cardRef} className={cn('relative overflow-hidden', className)}>
      <div
        ref={gradientRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300"
        style={{ background: 'transparent' }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
