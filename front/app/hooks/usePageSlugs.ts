import { useState, useEffect } from 'react';
import { listPages, POLICY_PAGES, FIXED_PAGES } from 'services/pages';
import { isNilOrError } from 'utils/helperUtils';

type TPageSlugs = Set<string> | undefined | null | Error;

export default function usePageSlugs() {
  const [pageSlugs, setPageSlugs] = useState<TPageSlugs>();

  useEffect(() => {
    const subscription = listPages().observable.subscribe((response) => {
      if (isNilOrError(response)) {
        setPageSlugs(response);
        return;
      }

      const pageSlugs = response.data.map((page) => page.attributes.slug);
      setPageSlugs(new Set([...pageSlugs, ...POLICY_PAGES, ...FIXED_PAGES]));
    });

    return () => subscription.unsubscribe();
  }, []);

  return pageSlugs;
}
