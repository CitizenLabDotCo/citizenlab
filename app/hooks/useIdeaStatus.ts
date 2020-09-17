import { useState, useEffect } from 'react';
import { IIdeaStatusData, ideaStatusStream } from 'services/ideaStatuses';

export default function useSimilarIdeas({ statusId }) {
  const [ideaStatus, setIdeaStatus] = useState<
    IIdeaStatusData | Error | null | undefined
  >(undefined);

  useEffect(() => {
    const observable = ideaStatusStream(statusId).observable;

    const subscription = observable.subscribe((response) => {
      setIdeaStatus(response.data);
    });

    return () => subscription.unsubscribe();
  }, [statusId]);

  return ideaStatus;
}
