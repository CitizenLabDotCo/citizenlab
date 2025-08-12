import { useEffect, useRef, useState } from 'react';

interface UseFilterOpenByDefaultProps {
  shouldOpenByDefault?: boolean;
  onOpened?: () => void;
  filterRef: React.RefObject<HTMLElement>;
}

export const useFilterOpenByDefault = ({
  shouldOpenByDefault,
  onOpened,
  filterRef,
}: UseFilterOpenByDefaultProps) => {
  const [isOpened, setIsOpened] = useState(false);
  // Track if we've already auto-opened (doesn't need to trigger re-renders)
  const openedOnceRef = useRef(false);

  // Auto-open exactly once when shouldOpenByDefault becomes true
  useEffect(() => {
    if (shouldOpenByDefault && !openedOnceRef.current) {
      openedOnceRef.current = true;
      setIsOpened(true);
      onOpened?.();
    }
  }, [shouldOpenByDefault, onOpened]);

  // Close on outside click/tap while open
  useEffect(() => {
    if (!isOpened) return;

    const handlePointerDown = (event: PointerEvent) => {
      const el = filterRef.current;
      if (!el) return;
      const target = event.target as Node | null;
      if (!target || el.contains(target)) return;
      setIsOpened(false);
    };

    // capture:true helps if consumers stopPropagation
    document.addEventListener('pointerdown', handlePointerDown, {
      capture: true,
    });
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, {
        capture: true,
      });
    };
  }, [isOpened, filterRef]);

  // Close on Escape
  useEffect(() => {
    if (!isOpened) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpened(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpened]);

  return {
    isOpened,
    setIsOpened,
  };
};
