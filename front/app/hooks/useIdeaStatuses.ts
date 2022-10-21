import { useEffect, useState } from 'react';
import { ideaStatusesStream, IIdeaStatusData } from 'services/ideaStatuses';
import { isNilOrError } from 'utils/helperUtils';

export default function useIdeaStatuses() {
  const [ideaStatuses, setIdeaStatuses] = useState<
    IIdeaStatusData[] | null | Error
  >(null);

  useEffect(() => {
    const observable = ideaStatusesStream().observable;

    const subscription = observable.subscribe((response) => {
      isNilOrError(response)
        ? setIdeaStatuses(response)
        : setIdeaStatuses(response.data);
    });

    return () => subscription.unsubscribe();
  }, []);

  return ideaStatuses;
}
