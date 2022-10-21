import { TNavbarItemsState } from 'hooks/useNavbarItems';
import { useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { removedDefaultNavbarItems } from '../services/navbar';

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
