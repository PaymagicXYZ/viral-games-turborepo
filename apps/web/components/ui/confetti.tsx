import React from 'react';
import { createPortal } from 'react-dom';
import NextConfetti from 'react-confetti';

export default function Confetti({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999999, // Extremely high z-index
      }}
    >
      <NextConfetti width={window.innerWidth} height={window.innerHeight} />
    </div>,
    document.body,
  );
}
