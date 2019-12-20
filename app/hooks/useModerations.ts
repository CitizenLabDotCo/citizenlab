import { useState, useEffect, useCallback } from 'react';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { moderationsStream, IModerationData, TModerationStatuses } from 'services/moderations';
import { isNilOrError } from 'utils/helperUtils';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

interface InputProps {
  pageNumber?: number;
  pageSize?: number;
  moderationStatus?: TModerationStatuses;
}

export default function useModerations({ pageNumber = 1, pageSize = 12, moderationStatus = undefined } : InputProps = {}) {
  const pageNumber$ = new BehaviorSubject(pageNumber);
  const pageSize$ = new BehaviorSubject(pageSize);
  const moderationStatus$ = new BehaviorSubject(moderationStatus);

  const [list, setList] = useState<IModerationData[] | undefined | null | Error>(undefined);
  const [internalPageSize, setInternalPageSize] = useState(pageSize);
  const [internalModerationStatus, setInternalModerationStatus] = useState(moderationStatus);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const onPageNumberChange = useCallback((pageNumber: number) => {
    pageNumber$.next(pageNumber);
  }, []);

  const onPageSizeChange = useCallback((pageSize: number) => {
    pageSize$.next(pageSize);
    pageNumber$.next(1);
  }, []);

  const onModerationStatusChange = useCallback((moderationStatus: TModerationStatuses) => {
    moderationStatus$.next((moderationStatus === 'read' || moderationStatus === 'unread') ? moderationStatus : undefined);
  }, []);

  useEffect(() => {
    pageNumber$.next(pageNumber);
    pageSize$.next(pageSize);
    moderationStatus$.next(moderationStatus);
  }, [pageNumber, pageSize, moderationStatus]);

  useEffect(() => {
    const subscription = combineLatest(
      pageNumber$.pipe(distinctUntilChanged()),
      pageSize$.pipe(distinctUntilChanged()),
      moderationStatus$.pipe(distinctUntilChanged())
    ).pipe(
      map(([pageNumber, pageSize, moderationStatus]) => ({ pageNumber, pageSize, moderationStatus })),
      distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
      switchMap(({ pageNumber, pageSize, moderationStatus }) => {
        return moderationsStream({
          queryParameters: {
            'page[number]': pageNumber,
            'page[size]': pageSize,
            moderation_status: moderationStatus
          }
        }).observable.pipe(
          map(response => ({ response, moderationStatus, pageSize }))
        );
      })
    )
    .subscribe(({ response, moderationStatus, pageSize }) => {
      const list = !isNilOrError(response) ? response.data : response;
      const currentPage = getPageNumberFromUrl(response?.links?.self) || 1;
      const lastPage = getPageNumberFromUrl(response?.links?.last) || 1;
      setList(list);
      setCurrentPage(currentPage);
      setLastPage(lastPage);
      setInternalPageSize(pageSize)
      setInternalModerationStatus(moderationStatus);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    list,
    currentPage,
    lastPage,
    onPageNumberChange,
    onPageSizeChange,
    onModerationStatusChange,
    pageSize: internalPageSize,
    moderationStatus: internalModerationStatus
  };
}
