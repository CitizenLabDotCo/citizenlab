import { useState, useEffect } from 'react';
import { navbarItemsStream, INavbarItem } from 'services/navbar';
import { isNilOrError } from 'utils/helperUtils';

export type TNavbarItemsState = INavbarItem[] | undefined | null | Error;

export default function useNavbarItems() {
  const [navbarItems, setNavbarItems] = useState<TNavbarItemsState>(undefined);

  useEffect(() => {
    const subscription = navbarItemsStream().observable.subscribe(
      (response) => {
        if (isNilOrError(response)) {
          setNavbarItems(response);
          return;
        }

        setNavbarItems(response.data);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return navbarItems;
}
