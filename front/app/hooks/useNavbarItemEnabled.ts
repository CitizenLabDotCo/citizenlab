import { useEffect, useState } from 'react';
import { navbarItemsStream, TDefaultNavbarItemCode } from 'services/navbar';
import { isNilOrError } from 'utils/helperUtils';

export default function useNavbarItemEnabled(code: TDefaultNavbarItemCode) {
  const [itemEnabled, setItemEnabled] = useState<
    undefined | null | Error | boolean
  >(undefined);

  useEffect(() => {
    const subscription = navbarItemsStream().observable.subscribe(
      (response) => {
        if (isNilOrError(response)) {
          setItemEnabled(response);
          return;
        }

        setItemEnabled(
          response.data.some(
            (navbarItem) => code === navbarItem.attributes.code
          )
        );
      }
    );

    return () => subscription.unsubscribe();
  }, [code]);

  return itemEnabled;
}
