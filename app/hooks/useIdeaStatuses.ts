import { useState, useEffect } from 'react';
import { IIdeaStatuses, ideaStatusesStream } from 'services/ideaStatuses';
import { isNilOrError } from 'utils/helperUtils';

export default function useIdeaStatuses() {
  const [ideaStatuses, setIdeaStatuses] = useState<
    IIdeaStatuses | null | undefined
  >(undefined);

  useEffect(() => {
    const observable = ideaStatusesStream().observable;

    const subscription = observable.subscribe((response) => {
      isNilOrError(response)
        ? setIdeaStatuses(response)
        : setIdeaStatuses(response.data as any);
    });

    return () => subscription.unsubscribe();
  }, []);

  return ideaStatuses;
}
