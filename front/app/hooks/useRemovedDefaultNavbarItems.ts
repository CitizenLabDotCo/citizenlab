import { useState, useEffect } from 'react';
import { TNavbarItemsState } from 'hooks/useNavbarItems';
import { removedDefaultNavbarItems } from 'services/navbar';
import { isNilOrError } from 'utils/helperUtils';

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
