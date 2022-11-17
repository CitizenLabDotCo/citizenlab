import { useState, useEffect } from 'react';
import { areasStream, IAreaData } from 'services/areas';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  forHomepageFilter?: boolean;
  includeStaticPages?: boolean;
}

export default function useAreas({
  forHomepageFilter,
  includeStaticPages,
}: Props = {}) {
  const [areas, setAreas] = useState<IAreaData[] | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    const queryParameters = {
      for_homepage_filter: forHomepageFilter,
      ...(includeStaticPages && {
        include_static_pages: true,
      }),
    };

    const subscription = areasStream({ queryParameters }).observable.subscribe(
      (areas) => {
        isNilOrError(areas) ? setAreas(areas) : setAreas(areas.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [forHomepageFilter]);

  return areas;
}
