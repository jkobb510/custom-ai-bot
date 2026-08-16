'use client';

import { useEffect, useRef } from 'react';

export function useAutoScroll(trigger, enabled = true, behavior = 'smooth') {
  const endRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof endRef.current?.scrollIntoView === 'function') {
      endRef.current.scrollIntoView({ behavior });
    }
  }, [trigger, enabled, behavior]);

  return endRef;
}