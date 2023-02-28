import { useEffect, useState } from 'react';
import { of, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IIdeaData, ideaByIdStream } from 'services/ideas';
import { isNilOrError } from 'utils/helperUtils';

type TIdeaList = (IIdeaData | Error)[] | null | Error;

export default function useIdeaList(ideaIds: string[] | null) {
  const [ideaList, setIdeaList] = useState<TIdeaList>(null);

  const stringifiedIdeaIds = JSON.stringify(ideaIds);

  useEffect(() => {
    setIdeaList(null);

    let observable: Observable<TIdeaList> = of(null);

    if (ideaIds && ideaIds.length > 0) {
      observable = combineLatest(
        ideaIds.map((ideaId) =>
          ideaByIdStream(ideaId).observable.pipe(
            map((idea) => (!isNilOrError(idea) ? idea.data : idea))
          )
        )
      );
    }

    const subscription = observable.subscribe((response) => {
      setIdeaList(response);
    });

    return () => subscription.unsubscribe();
  }, [stringifiedIdeaIds]);

  return ideaList;
}
