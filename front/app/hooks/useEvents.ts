import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import {
  IEventData,
  eventsStream,
  IProjectsStreamParams,
} from 'services/events';

export default function useEvents(
  projectIds?: string[],
  futureOnly?: string | Date,
  pastOnly?: string | Date
) {
  const [events, setEvents] = useState<IEventData[] | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    setEvents(undefined);

    const streamParams: IProjectsStreamParams = {
      queryParameters: { project_ids: projectIds },
    };

    if (futureOnly) {
      streamParams.queryParameters.start_at_gteq = new Date();
    }

    if (pastOnly) {
      streamParams.queryParameters.start_at_lt = new Date();
    }

    const subscription = eventsStream(streamParams).observable.subscribe(
      (response) => {
        const events = !isNilOrError(response) ? response.data : response;
        setEvents(events);
      }
    );

    return () => subscription.unsubscribe();
  }, [projectIds, futureOnly, pastOnly]);

  return events;
}
