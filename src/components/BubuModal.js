'use client';

import { useEffect } from 'react';
import assetConfig from '@/config/assets.json';

export default function BubuModal({ isOpen, onClose }) {
  // Load Tenor embed script when modal is visible
  useEffect(() => {
    if (isOpen) {
      const existingScript = document.getElementById('tenor-embed-script');
      if (existingScript) {
        existingScript.remove();
      }
      const script = document.createElement('script');
      script.id = 'tenor-embed-script';
      script.src = assetConfig.tenor.embedScriptSrc;
      script.async = true;
      document.body.appendChild(script);
      return () => {
        const embeddedScript = document.getElementById('tenor-embed-script');
        if (embeddedScript) {
          embeddedScript.remove();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modalOverlay" data-testid="bubu-modal">
      <div className="modalContent">
        <iframe
          src={assetConfig.tenor.embedSrc}
          width="100%"
          height="280"
          style={{ border: 'none', borderRadius: '12px', overflow: 'hidden' }}
          title={assetConfig.tenor.title}
          allowFullScreen
        />
        <button
          onClick={() => onClose(false)}
          className="closeModalButton"
          data-testid="close-modal-button"
          type="button"
        >
          Enter Chat
        </button>
        <button
          onClick={() => onClose(true)}
          className="dontShowModalButton"
          data-testid="dont-show-modal-button"
          type="button"
        >
          Don&apos;t show this modal again
        </button>
      </div>
    </div>
  );
}
