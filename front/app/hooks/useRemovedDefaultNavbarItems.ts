import { INavbarItem } from 'api/navbar/types';
import { useState, useEffect } from 'react';
import { removedDefaultNavbarItems } from 'services/navbar';
import { isNilOrError } from 'utils/helperUtils';

export type TNavbarItemsState = INavbarItem[] | undefined | null | Error;

export default function useRemovedDefaultNavbarItems() {
  const [navbarItems, setNavbarItems] = useState<TNavbarItemsState>(undefined);

  useEffect(() => {
    const subscription = removedDefaultNavbarItems().observable.subscribe(
      (response) => {
        isNilOrError(response)
          ? setNavbarItems(response)
          : setNavbarItems(response.data);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return navbarItems;
}
