import { useState, useEffect } from 'react';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, of, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, switchMap } from 'rxjs/operators';
import {
  ICustomPageData,
  ICustomPage,
  ICustomPages,
  listCustomPages,
  customPageByIdStream,
} from 'services/customPages';
import { isNilOrError, NilOrError, reduceErrors } from 'utils/helperUtils';

interface IParams {
  ids?: string[];
}

export type TPagesState = ICustomPageData[] | NilOrError;

export default function useCustomPages({ ids }: IParams = {}) {
  const [customPages, setCustomPages] = useState<TPagesState>(undefined);

  const inputProps$ = new BehaviorSubject({ ids });

  useEffect(() => {
    const subscription = createSubscription(inputProps$, setCustomPages);
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    inputProps$.next({ ids });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  return customPages;
}

type SetPages = (pages: ICustomPageData[] | NilOrError) => void;

function createSubscription(inputProps$, setPages: SetPages) {
  return inputProps$
    .pipe(
      distinctUntilChanged((prev, next) => isEqual(prev, next)),
      switchMap(({ ids }) => {
        if (ids) {
          if (ids.length === 0) return of(null);

          return combineLatest(
            ids.map((id) =>
              customPageByIdStream(id).observable.pipe(
                map((response: ICustomPage | NilOrError) => {
                  return isNilOrError(response) ? response : response.data;
                })
              )
            )
          );
        }

        return listCustomPages().observable.pipe(
          map((response: ICustomPages | NilOrError) => {
            return isNilOrError(response) ? response : response.data;
          })
        );
      })
    )
    .subscribe(reduceErrors<ICustomPageData>(setPages));
}
