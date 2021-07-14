import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { IEventData, eventsStream, IEventsStreamParams } from 'services/events';

interface InputParameters {
  projectIds?: string[];
  futureOnly?: boolean;
  pastOnly?: boolean;
  currentPage?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 10;

export default function useEvents(parameters: InputParameters) {
  const [events, setEvents] = useState<IEventData[] | undefined | null | Error>(
    undefined
  );
  const [projectIds, setProjectIds] = useState<string[]>(
    parameters.projectIds ?? []
  );
  const [currentPage, setCurrentPage] = useState<number>(
    parameters.currentPage ?? 1
  );
  const [lastPage, setLastPage] = useState(1);
  const [pageSize] = useState(parameters.pageSize ?? DEFAULT_PAGE_SIZE);

  const onProjectIdsChange = (projectIds: string[]) => {
    setProjectIds([...projectIds]);
  };

  const onCurrentPageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    setEvents(undefined);

    const streamParams: IEventsStreamParams = {
      queryParameters: { project_ids: projectIds },
    };

    if (parameters.futureOnly) {
      streamParams.queryParameters.start_at_gteq = new Date().toJSON();
    }

    if (parameters.pastOnly) {
      streamParams.queryParameters.start_at_lt = new Date().toJSON();
    }

    if (currentPage) {
      streamParams.queryParameters['page[number]'] = currentPage;
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
  }, [
    parameters.futureOnly,
    parameters.pastOnly,
    projectIds,
    currentPage,
    pageSize,
  ]);

  return {
    events,
    projectIds,
    currentPage,
    lastPage,
    pageSize,
    onProjectIdsChange,
    onCurrentPageChange,
  };
}
