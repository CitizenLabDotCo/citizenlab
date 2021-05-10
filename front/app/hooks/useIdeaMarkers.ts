import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { IIdeaMarkerData, ideasMarkersStream } from 'services/ideas';
import { Sort } from 'resources/GetIdeas';

interface Props {
  phaseId?: string | null;
  projectIds?: string[] | null;
  sort?: Sort;
}

export default function useIdeaMarkers({ phaseId, projectIds, sort }: Props) {
  const [ideaMarkers, setIdeaMarkers] = useState<
    IIdeaMarkerData[] | undefined | null
  >(undefined);

  useEffect(() => {
    setIdeaMarkers(undefined);

    const subscription = ideasMarkersStream({
      queryParameters: {
        sort,
        'page[size]': 2000,
        location_required: true,
        projects: projectIds,
        phase: phaseId,
      },
    }).observable.subscribe((response) => {
      setIdeaMarkers(!isNilOrError(response) ? response.data : null);
    });

    return () => subscription.unsubscribe();
  }, [phaseId, projectIds, sort]);

  return ideaMarkers;
}
