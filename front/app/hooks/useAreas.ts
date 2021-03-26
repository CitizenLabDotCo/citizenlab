import { useState, useEffect } from 'react';
import { areasStream, IAreas } from 'services/areas';

export default function useAreas() {
  const [areas, setAreas] = useState<IAreas | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    const subscription = areasStream().observable.subscribe((areas) => {
      setAreas(areas);
    });

    return () => subscription.unsubscribe();
  }, []);

  return areas;
}
