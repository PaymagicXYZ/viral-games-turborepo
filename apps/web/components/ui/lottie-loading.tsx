'use client';

import { LottiePlayer } from 'lottie-web';
import { useEffect, useRef, useState } from 'react';

export const LottieLoading = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [lottie, setLottie] = useState<LottiePlayer | null>(null);

  useEffect(() => {
    import('lottie-web').then((Lottie) => setLottie(Lottie.default));
  }, []);

  useEffect(() => {
    if (lottie && ref.current) {
      const animation = lottie.loadAnimation({
        container: ref.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/loading-animation.json',
      });

      return () => animation.destroy();
    }
  }, [lottie]);

  return <div className='h-full w-full' ref={ref} />;
};

export default LottieLoading;
