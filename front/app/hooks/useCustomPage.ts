import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Observable, of } from 'rxjs';
import {
  ICustomPage,
  ICustomPageData,
  customPageByIdStream,
  customPageBySlugStream,
} from 'services/customPages';

interface Props {
  customPageId?: string | null;
  customPageSlug?: string | null;
}

export default function useCustomPage({
  customPageId: pageId,
  customPageSlug: pageSlug,
}: Props) {
  const [customPage, setCustomPage] = useState<
    ICustomPageData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    setCustomPage(undefined);

    let observable: Observable<ICustomPage | null> = of(null);

    if (pageId) {
      observable = customPageByIdStream(pageId).observable;
    } else if (pageSlug) {
      observable = customPageBySlugStream(pageSlug).observable;
    }

    const subscription = observable.subscribe((response) => {
      isNilOrError(response)
        ? setCustomPage(response)
        : setCustomPage(response.data);
    });

    return () => subscription.unsubscribe();
  }, [pageId, pageSlug]);

  return customPage;
}
