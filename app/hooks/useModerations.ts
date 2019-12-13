import { useState, useEffect, useCallback } from 'react';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { moderationsStream, IModeration, TModerationStatuses } from 'services/moderations';
import { isNilOrError } from 'utils/helperUtils';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

interface InputProps {
  pageNumber?: number;
  pageSize?: number;
  moderationStatus?: TModerationStatuses;
}

export default function useModerations({ pageNumber = 1, pageSize = 12, moderationStatus = 'unread' } : InputProps = {}) {
  const inputProps$ = new BehaviorSubject({ pageNumber, pageSize, moderationStatus });
  const pageChanges$ = new BehaviorSubject(pageNumber || 1);

  const [list, setList] = useState<IModeration[] | undefined | null | Error>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);

  const onPageChange = useCallback((pageNumber: number) => {
    pageChanges$.next(pageNumber);
  }, []);

  useEffect(() => {
    const subscription = combineLatest(
      inputProps$,
      pageChanges$
    ).pipe(
      map(([inputProps, pageNumber]) => ({ ...inputProps, pageNumber })),
      distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
      switchMap(({ pageNumber, pageSize, moderationStatus }) => {
        return moderationsStream({
          queryParameters: {
            'page[number]': pageNumber,
            'page[size]': pageSize,
            moderation_status: moderationStatus
          }
        }).observable;
      })
    ).subscribe((response) => {
      const list = !isNilOrError(response) ? response.data : response;
      const currentPage = getPageNumberFromUrl(response?.links?.self) || 1;
      const lastPage = getPageNumberFromUrl(response?.links?.last) || 1;
      setList(list);
      setCurrentPage(currentPage);
      setLastPage(lastPage);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    list,
    currentPage,
    lastPage,
    onPageChange
  };
}
