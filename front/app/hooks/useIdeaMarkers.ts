import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { IGeotaggedIdeaData, ideasMarkersStream } from 'services/ideas';

interface Props {
  phaseId?: string | null;
  projectIds?: string[] | null;
}

export default function useIdeaMarkers({ phaseId, projectIds }: Props) {
  const [ideaMarkers, setIdeaMarkers] = useState<
    IGeotaggedIdeaData[] | undefined | null
  >(undefined);

  useEffect(() => {
    setIdeaMarkers(undefined);

    const subscription = ideasMarkersStream({
      queryParameters: {
        projects: projectIds,
        phase: phaseId,
      },
    }).observable.subscribe((response) => {
      setIdeaMarkers(!isNilOrError(response) ? response.data : null);
    });

    return () => subscription.unsubscribe();
  }, [phaseId, projectIds]);

  return ideaMarkers;
}
