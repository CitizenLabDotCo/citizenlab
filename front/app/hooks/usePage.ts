import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Observable, of } from 'rxjs';
import {
  IPage,
  IPageData,
  pageByIdStream,
  pageBySlugStream,
} from 'services/pages';

interface Props {
  pageId?: string | null;
  pageSlug?: string | null;
}

export default function usePage({ pageId, pageSlug }: Props) {
  const [page, setPage] = useState<IPageData | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    setPage(undefined);

    let observable: Observable<IPage | null> = of(null);

    if (pageId) {
      observable = pageByIdStream(pageId).observable;
    } else if (pageSlug) {
      observable = pageBySlugStream(pageSlug).observable;
    }

    const subscription = observable.subscribe((response) => {
      isNilOrError(response) ? setPage(response) : setPage(response.data);
    });

    return () => subscription.unsubscribe();
  }, [pageId, pageSlug]);

  return page;
}
