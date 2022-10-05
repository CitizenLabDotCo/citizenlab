import { useState, useEffect } from 'react';
import { customPageBySlugStream, ICustomPageData } from 'services/customPages';
import { isNilOrError } from 'utils/helperUtils';

export default function useCustomPage(customPageSlug: string) {
  const [customPage, setCustomPage] = useState<ICustomPageData | null | Error>(
    null
  );

  useEffect(() => {
    const subscription = customPageBySlugStream(
      customPageSlug
    ).observable.subscribe((returnedCustomPage) => {
      const apiCustomPage = !isNilOrError(returnedCustomPage)
        ? returnedCustomPage.data
        : returnedCustomPage;
      setCustomPage(apiCustomPage);
    });

    return () => subscription.unsubscribe();
  }, [customPageSlug]);

  return customPage;
}
