import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

export default function AnimatedCounter({ value, suffix = '', duration = 2 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (el) el.textContent = Math.round(obj.val).toString() + suffix;
      },
    });
  }, [value, suffix, duration]);

  return <span ref={ref}>0{suffix}</span>;
}