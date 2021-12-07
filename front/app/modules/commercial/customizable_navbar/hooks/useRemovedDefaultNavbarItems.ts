import { useState, useEffect } from 'react';
import { removedDefaultNavbarItems } from '../services/navbar';
import { isNilOrError } from 'utils/helperUtils';
import { TNavbarItemsState } from 'hooks/useNavbarItems';

export default function useNavbarItems() {
  const [navbarItems, setNavbarItems] = useState<TNavbarItemsState>(undefined);

  useEffect(() => {
    const subscription = removedDefaultNavbarItems().observable.subscribe(
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
