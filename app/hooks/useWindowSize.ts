import { useState, useEffect } from 'react';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState<number | undefined | null>(window.innerWidth);

  useEffect(() => {
    const subscription = fromEvent(window, 'resize').pipe(
      debounceTime(50),
      distinctUntilChanged()
    ).subscribe((event) => {
      if (event.target) {
        const size = event.target['innerWidth'] as number;
        setWindowSize(size);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return windowSize;
}
