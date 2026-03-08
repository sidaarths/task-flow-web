'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  inView?: boolean;
  blur?: string;
}

export function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.3,
  inView: triggerInView = false,
  blur = '4px',
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const shouldAnimate = triggerInView ? isInView : true;

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{ opacity: 0, filter: `blur(${blur})`, y: 4 }}
      animate={shouldAnimate ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
