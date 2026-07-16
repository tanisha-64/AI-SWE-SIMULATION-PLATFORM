import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let activeRequests = 0;
let listeners: ((active: boolean) => void)[] = [];

export function notifyRequestStart() {
  activeRequests++;
  listeners.forEach((l) => l(true));
}

export function notifyRequestEnd() {
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) {
    listeners.forEach((l) => l(false));
  }
}

export default function TopProgressBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const listener = (active: boolean) => setVisible(active);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 z-[100] origin-left"
        />
      )}
    </AnimatePresence>
  );
}