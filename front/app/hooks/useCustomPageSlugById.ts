import { useState, useEffect } from 'react';
import { listCustomPages } from 'services/customPages';
import { isNilOrError } from 'utils/helperUtils';

export type TPageSlugById = Record<string, string>;
type TPageSlugByIdState = undefined | null | Error | TPageSlugById;

export default function useCustomPageSlugById() {
  const [customPageSlugById, setCustomPageSlugById] =
    useState<TPageSlugByIdState>(undefined);

  useEffect(() => {
    const subscription = listCustomPages().observable.subscribe((response) => {
      if (isNilOrError(response)) {
        setCustomPageSlugById(response);
        return;
      }

      setCustomPageSlugById(
        response.data.reduce((acc, page) => {
          acc[page.id] = `/pages/${page.attributes.slug}`;
          return acc;
        }, {})
      );
    });

    return () => subscription.unsubscribe();
  }, []);

  return customPageSlugById;
}
