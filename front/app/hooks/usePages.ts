import { useState, useEffect } from 'react';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, of, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, switchMap } from 'rxjs/operators';
import {
  IPageData,
  IPage,
  IPages,
  listPages,
  pageByIdStream,
} from 'services/pages';
import { isNilOrError, NilOrError, reduceErrors } from 'utils/helperUtils';

interface IParams {
  ids?: string[];
}

export type TPagesState = IPageData[] | NilOrError;

export default function usePages({ ids }: IParams = {}) {
  const [pages, setPages] = useState<TPagesState>(undefined);

  const inputProps$ = new BehaviorSubject({ ids });

  useEffect(() => {
    const subscription = createSubscription(inputProps$, setPages);
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    inputProps$.next({ ids });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  return pages;
}

type SetPages = (pages: IPageData[] | NilOrError) => void;

function createSubscription(inputProps$, setPages: SetPages) {
  return inputProps$
    .pipe(
      distinctUntilChanged((prev, next) => isEqual(prev, next)),
      switchMap(({ ids }) => {
        if (ids) {
          if (ids.length === 0) return of(null);

          return combineLatest(
            ids.map((id) =>
              pageByIdStream(id).observable.pipe(
                map((response: IPage | NilOrError) => {
                  return isNilOrError(response) ? response : response.data;
                })
              )
            )
          );
        }

        return listPages().observable.pipe(
          map((response: IPages | NilOrError) => {
            return isNilOrError(response) ? response : response.data;
          })
        );
      })
    )
    .subscribe(reduceErrors<IPageData>(setPages));
}
