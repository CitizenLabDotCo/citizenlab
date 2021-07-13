import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { IEventData, eventsStream, IEventsStreamParams } from 'services/events';

interface InputParameters {
  projectIds?: string[];
  futureOnly?: boolean;
  pastOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export default function useEvents({
  projectIds,
  futureOnly,
  pastOnly,
  page,
  pageSize,
}: InputParameters) {
  const [events, setEvents] = useState<IEventData[] | undefined | null | Error>(
    undefined
  );
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    setEvents(undefined);

    const streamParams: IEventsStreamParams = {
      queryParameters: { project_ids: projectIds },
    };

    if (futureOnly) {
      streamParams.queryParameters.start_at_gteq = new Date().toJSON();
    }

    if (pastOnly) {
      streamParams.queryParameters.start_at_lt = new Date().toJSON();
    }

    if (page) {
      streamParams.queryParameters['page[number]'] = page;
    }

    if (pageSize) {
      streamParams.queryParameters['page[size]'] = pageSize;
    }

    const subscription = eventsStream(streamParams).observable.subscribe(
      (response) => {
        if (isNilOrError(response)) {
          setEvents(response);
          setLastPage(1);
          return;
        }

        const lastPageNumber = getPageNumberFromUrl(response.links?.last) ?? 1;

        setEvents(response.data);
        setLastPage(lastPageNumber);
      }
    );

    return () => subscription.unsubscribe();
  }, [projectIds, futureOnly, pastOnly, page, pageSize]);

  return { events, lastPage };
}
