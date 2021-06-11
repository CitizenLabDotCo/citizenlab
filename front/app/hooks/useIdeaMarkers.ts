import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { IIdeaMarkerData, ideasMarkersStream } from 'services/ideas';
import { Sort } from 'resources/GetIdeas';
import { ideaDefaultSortMethodFallback } from 'services/participationContexts';

interface Props {
  phaseId?: string | null;
  projectIds?: string[] | null;
  sort?: Sort;
  search?: string | null;
  topics?: string[] | null;
}

export default function useIdeaMarkers({
  phaseId,
  projectIds,
  sort,
  search,
  topics,
}: Props) {
  const [ideaMarkers, setIdeaMarkers] = useState<
    IIdeaMarkerData[] | undefined | null
  >(undefined);

  useEffect(() => {
    setIdeaMarkers(undefined);

    const subscription = ideasMarkersStream({
      queryParameters: {
        'page[size]': 2000,
        location_required: true,
        projects: projectIds,
        phase: phaseId,
        sort: sort || ideaDefaultSortMethodFallback,
        search: search || undefined,
        topics: topics || undefined,
      },
    }).observable.subscribe((response) => {
      setIdeaMarkers(!isNilOrError(response) ? response.data : null);
    });

    return () => subscription.unsubscribe();
  }, [phaseId, projectIds, sort, search, topics]);

  return ideaMarkers;
}
