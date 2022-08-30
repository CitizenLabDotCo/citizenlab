import { useState, useEffect } from 'react';
import {
  customPageByIdStream,
} from 'services/customPages';
import { isNilOrError } from 'utils/helperUtils';

export default function useCustomPage(customPageId: string) {
  const [customPage, setCustomPage] = useState(null);

  useEffect(() => {
    const subscription = customPageByIdStream(customPageId).observable.subscribe(
      (returnedCustomPage) => {
        isNilOrError(returnedCustomPage)
        // @ts-ignore
          ? setCustomPage(returnedCustomPage)
        // @ts-ignore
          : setCustomPage(returnedCustomPage.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [customPageId]);

  return customPage;
}
