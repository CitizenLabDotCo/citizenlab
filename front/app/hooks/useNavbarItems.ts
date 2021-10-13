import { useState, useEffect } from 'react';
import {
  navbarItemsStream,
  INavbarItem,
  INavbarItemsStreamParams,
} from 'services/navbar';
import { isNilOrError } from 'utils/helperUtils';

export type TNavbarItemsState = INavbarItem[] | undefined | null | Error;

export default function useNavbarItems(params?: INavbarItemsStreamParams) {
  const [navbarItems, setNavbarItems] = useState<TNavbarItemsState>(undefined);

  useEffect(() => {
    const subscription = navbarItemsStream(params).observable.subscribe(
      (response) => {
        if (isNilOrError(response)) {
          setNavbarItems(response);
          return;
        }

        console.log(
          response.data.map((n) => ({
            ordering: n.attributes.ordering,
            visible: n.attributes.visible,
          }))
        );
        setNavbarItems(response.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [params, params?.visible]);

  return navbarItems;
}
