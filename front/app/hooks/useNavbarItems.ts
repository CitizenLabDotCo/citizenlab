import { useState, useEffect } from 'react';
import {
  navbarItemsStream,
  INavbarItem,
  INavbarItemsStreamParams,
} from 'services/navbar';
import { isNilOrError } from 'utils/helperUtils';

export type TNavbarItemsState = INavbarItem[] | undefined | null | Error;

// This is to remove the weird footer page- see CL2-6795
const removeHomepageInfoPage = (item: INavbarItem) => {
  const multiloc = item.attributes.title_multiloc;
  const firstLocale = Object.values(multiloc)[0];

  return firstLocale.length > 0;
};

export default function useNavbarItems(params?: INavbarItemsStreamParams) {
  const [navbarItems, setNavbarItems] = useState<TNavbarItemsState>(undefined);

  useEffect(() => {
    const subscription = navbarItemsStream(params).observable.subscribe(
      (response) => {
        if (isNilOrError(response)) {
          setNavbarItems(response);
          return;
        }

        setNavbarItems(response.data.filter(removeHomepageInfoPage));
      }
    );

    return () => subscription.unsubscribe();
  }, [params, params?.visible]);

  return navbarItems;
}
