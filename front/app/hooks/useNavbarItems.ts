import { useState, useEffect } from 'react';
import { navbarItemsStream, INavbarItem } from 'services/navbar';

export type TNavbarItemsState = INavbarItem[] | undefined | null | Error;

export default function useNavbarItems() {
  const [navbarItems, setNavbarItems] = useState<TNavbarItemsState>(undefined);

  useEffect(() => {
    const subscription = navbarItemsStream().observable.subscribe(
      (response) => {
        setNavbarItems(response.data);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return navbarItems;
}
