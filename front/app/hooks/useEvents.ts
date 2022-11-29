import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { IEventData, eventsStream, IEventsStreamParams } from 'services/events';
import { PublicationStatus } from 'services/projects';
import { useDeepCompareEffect } from 'react-use';
type sort = 'newest' | 'oldest';

interface InputParameters {
  projectIds?: string[];
  currentAndFutureOnly?: boolean;
  pastOnly?: boolean;
  pageSize?: number;
  sort?: sort;
  projectPublicationStatuses?: PublicationStatus[];
}

const DEFAULT_PAGE_SIZE = 10;

const getStart = (event: IEventData) => event.attributes.start_at;

const sortEvents = (_events: IEventData[], sort: sort) => {
  const events = [..._events]; // _events is immutable

  return sort === 'newest'
    ? events.sort((a, b) => (getStart(a) < getStart(b) ? 1 : -1))
    : events.sort((a, b) => (getStart(b) < getStart(a) ? 1 : -1));
};

export type TEvents = IEventData[] | null | Error;
export default function useEvents(parameters: InputParameters) {
  const [events, setEvents] = useState<TEvents>(null);
  const [projectIds, setProjectIds] = useState<string[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [pageSize] = useState(parameters.pageSize ?? DEFAULT_PAGE_SIZE);

  // projectIds can be based of other
  // requests, and initially be null/undefined.
  // Without the useEffect, it doesn't get updated
  // (or useDeepCompareEffect because we are comparing arrays here).
  useDeepCompareEffect(() => {
    if (parameters.projectIds) {
      setProjectIds(parameters.projectIds);
    }
  }, [parameters.projectIds]);

  const onProjectIdsChange = (projectIds: string[]) => {
    setProjectIds([...projectIds]);
  };

  const onCurrentPageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    setEvents(null);

    const streamParams: IEventsStreamParams = {
      queryParameters: {
        ...(projectIds && { project_ids: projectIds }),
      },
    };

    if (parameters.projectPublicationStatuses) {
      streamParams.queryParameters.project_publication_statuses =
        parameters.projectPublicationStatuses;
    }

    if (parameters.currentAndFutureOnly) {
      streamParams.queryParameters.ends_on_or_after_date = new Date().toJSON();
      streamParams.queryParameters.sort = 'start_at';
    }

    if (parameters.pastOnly) {
      streamParams.queryParameters.ends_before_date = new Date().toJSON();
      streamParams.queryParameters.sort = '-start_at';
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

        setEvents(sortEvents(response.data, parameters.sort ?? 'oldest'));
        setLastPage(lastPageNumber);
      }
    );

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    parameters.currentAndFutureOnly,
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
