import { useState, useEffect } from 'react';
import {
  navbarItemsStream,
  INavbarItem,
  INavbarItemsStreamParams,
} from 'services/navbar';
import { isNilOrError } from 'utils/helperUtils';

export default function useNavbarItems(params?: INavbarItemsStreamParams) {
  const [navbarItems, setNavbarItems] = useState<
    INavbarItem[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = navbarItemsStream(params).observable.subscribe(
      (response) => {
        if (isNilOrError(response)) {
          setNavbarItems(response);
          return;
        }

        setNavbarItems(response.data);
      }
    );

    return subscription.unsubscribe;
  }, [params?.visible]);

  return navbarItems;
}
