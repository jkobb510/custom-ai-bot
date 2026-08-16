'use client';

import { useEffect, useRef } from 'react';

export function useChatAudio(src) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audioRef.current = null;
    };
  }, [src]);

  return audioRef;
}