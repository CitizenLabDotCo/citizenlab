import { useState, useEffect } from 'react';
import { listPages } from 'services/pages';
import { isNilOrError } from 'utils/helperUtils';

export type TPageSlugById = Record<string, string>;
type TPageSlugByIdState = undefined | null | Error | TPageSlugById;

export default function usePageSlugById() {
  const [pageSlugById, setPageSlugById] =
    useState<TPageSlugByIdState>(undefined);

  useEffect(() => {
    const subscription = listPages().observable.subscribe((response) => {
      if (isNilOrError(response)) {
        setPageSlugById(response);
        return;
      }

      setPageSlugById(
        response.data.reduce((acc, page) => {
          acc[page.id] = `/pages/${page.attributes.slug}`;
          return acc;
        }, {})
      );
    });

    return () => subscription.unsubscribe();
  }, []);

  return pageSlugById;
}
