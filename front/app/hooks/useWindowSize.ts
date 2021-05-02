import { useState, useEffect } from 'react';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    windowWidth: number;
    windowHeight: number;
  }>({
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  });

  useEffect(() => {
    const subscription = fromEvent(window, 'resize', { passive: true })
      .pipe(debounceTime(50), distinctUntilChanged())
      .subscribe((event) => {
        if (event.target) {
          const windowWidth = event.target['innerWidth'] as number;
          const windowHeight = event.target['innerHeight'] as number;
          setWindowSize({ windowWidth, windowHeight });
        }
      });

    return () => subscription.unsubscribe();
  }, []);

  return windowSize;
}
