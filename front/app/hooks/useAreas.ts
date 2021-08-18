import { useState, useEffect } from 'react';
import { areasStream, IAreaData } from 'services/areas';

export default function useAreas() {
  const [areas, setAreas] = useState<IAreaData[] | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    const subscription = areasStream().observable.subscribe((response) => {
      setAreas(response.data);
    });

    return () => subscription.unsubscribe();
  }, []);

  return areas;
}
