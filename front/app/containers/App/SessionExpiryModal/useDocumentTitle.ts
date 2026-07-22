import { useEffect, useRef } from 'react';

/**
 * Sets the document title while mounted, restoring the previous title on unmount.
 */
export default function useDocumentTitle(title: string) {
  const previousTitleRef = useRef<string | null>(null);

  useEffect(() => {
    previousTitleRef.current = document.title;
    document.title = title;

    return () => {
      if (previousTitleRef.current !== null) {
        document.title = previousTitleRef.current;
      }
    };
  }, [title]);
}
