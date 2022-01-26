import { useState, useEffect } from 'react';
import { areasStream, IAreaData } from 'services/areas';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  forHomepageFilter?: boolean;
}

export default function useAreas({ forHomepageFilter }: Props = {}) {
  const [areas, setAreas] = useState<IAreaData[] | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    const queryParameters = { for_homepage_filter: forHomepageFilter };

    const subscription = areasStream({ queryParameters }).observable.subscribe(
      (areas) => {
        isNilOrError(areas) ? setAreas(areas) : setAreas(areas.data);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return areas;
}
