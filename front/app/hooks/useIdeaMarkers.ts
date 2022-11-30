import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { IIdeaMarkerData, ideasMarkersStream } from 'services/ideas';
import { Sort } from 'resources/GetIdeas';
import { ideaDefaultSortMethodFallback } from 'services/participationContexts';

interface Props {
  phaseId?: string | null;
  // As long as we JSON.parse this value, it can't be
  // undefined. This would result in an uncaught SyntaxError
  // aka page crash.
  projectIds: string[] | null;
  sort?: Sort;
  search?: string | null;
  // As long as we JSON.parse this value, it can't be
  // undefined. This would result in an uncaught SyntaxError
  // aka page crash.
  topics: string[] | null;
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

  // Stringifying the project IDs and topics to make useEffect dependency array happy
  const stringifiedProjectIds = JSON.stringify(projectIds);
  const stringifiedTopics = JSON.stringify(topics);

  useEffect(() => {
    setIdeaMarkers(undefined);

    const subscription = ideasMarkersStream({
      queryParameters: {
        'page[size]': 2000,
        location_required: true,
        projects: JSON.parse(stringifiedProjectIds),
        phase: phaseId,
        sort: sort || ideaDefaultSortMethodFallback,
        search: search || undefined,
        topics: JSON.parse(stringifiedTopics) || undefined,
      },
    }).observable.subscribe((response) => {
      setIdeaMarkers(!isNilOrError(response) ? response.data : null);
    });

    return () => subscription.unsubscribe();
  }, [phaseId, stringifiedProjectIds, sort, search, stringifiedTopics]);

  return ideaMarkers;
}
