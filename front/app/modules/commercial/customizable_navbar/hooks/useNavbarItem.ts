import { useState, useEffect } from 'react';
import { navbarItemsStream, INavbarItem } from 'services/navbar';
import { isNilOrError } from 'utils/helperUtils';

type TNavbarItemsState = INavbarItem | undefined | null | Error;

interface IParams {
  navbarItemId: string;
}

export default function useNavbarItem({ navbarItemId }: IParams) {
  const [navbarItem, setNavbarItem] = useState<TNavbarItemsState>(undefined);

  useEffect(() => {
    const subscription = navbarItemsStream().observable.subscribe(
      (response) => {
        if (isNilOrError(response)) {
          setNavbarItem(response);
          return;
        }

        setNavbarItem(
          response.data.find((navbarItem) => navbarItemId === navbarItem.id)
        );
      }
    );

    return () => subscription.unsubscribe();
  }, [navbarItemId]);

  return navbarItem;
}
