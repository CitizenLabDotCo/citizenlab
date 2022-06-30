import { useState, useEffect } from 'react';
import {
  navbarItemsStream,
  INavbarItem,
  MAX_TITLE_LENGTH,
} from 'services/navbar';
import { isNilOrError } from 'utils/helperUtils';
import { truncateMultiloc } from 'utils/textUtils';

export type TNavbarItemsState = INavbarItem[] | undefined | null | Error;

export default function useNavbarItems({ standard } = { standard: false }) {
  const [navbarItems, setNavbarItems] = useState<TNavbarItemsState>(undefined);

  useEffect(() => {
    const subscription = navbarItemsStream({
      standard,
    }).observable.subscribe((response) => {
      isNilOrError(response)
        ? setNavbarItems(response)
        : setNavbarItems(truncateTitles(response.data));
    });

    return () => subscription.unsubscribe();
  }, [standard]);

  return navbarItems;
}

const truncateTitles = (navbarItems: INavbarItem[]): INavbarItem[] => {
  return navbarItems.map((navbarItem) => {
    const titleMultiloc = navbarItem.attributes.title_multiloc;
    const truncatedTitleMultiloc = truncateMultiloc(
      titleMultiloc,
      MAX_TITLE_LENGTH
    );

    return {
      ...navbarItem,
      attributes: {
        ...navbarItem.attributes,
        title_multiloc: truncatedTitleMultiloc,
      },
    };
  });
};
