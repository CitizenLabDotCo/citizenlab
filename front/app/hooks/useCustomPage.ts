import { useState, useEffect } from 'react';
import { customPageByIdStream, ICustomPageData } from 'services/customPages';
import { isNilOrError } from 'utils/helperUtils';

export default function useCustomPage(customPageId: string) {
  const [customPage, setCustomPage] = useState<ICustomPageData | null | Error>(
    null
  );

  useEffect(() => {
    const subscription = customPageByIdStream(
      customPageId
    ).observable.subscribe((returnedCustomPage) => {
      const apiCustomPage = !isNilOrError(returnedCustomPage)
        ? returnedCustomPage.data
        : returnedCustomPage;
      setCustomPage(apiCustomPage);
    });

    return () => subscription.unsubscribe();
  }, [customPageId]);

  return customPage;
}
