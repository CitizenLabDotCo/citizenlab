import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Observable, of } from 'rxjs';
import {
  ICustomPage,
  ICustomPageData,
  customPageByIdStream,
  customPageBySlugStream,
} from 'services/staticPages';

interface Props {
  pageId?: string | null;
  pageSlug?: string | null;
}

export default function usePage({ pageId, pageSlug }: Props) {
  const [page, setPage] = useState<ICustomPageData | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    setPage(undefined);

    let observable: Observable<ICustomPage | null> = of(null);

    if (pageId) {
      observable = customPageByIdStream(pageId).observable;
    } else if (pageSlug) {
      observable = customPageBySlugStream(pageSlug).observable;
    }

    const subscription = observable.subscribe((response) => {
      isNilOrError(response) ? setPage(response) : setPage(response.data);
    });

    return () => subscription.unsubscribe();
  }, [pageId, pageSlug]);

  return page;
}
