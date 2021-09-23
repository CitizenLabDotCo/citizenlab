import { useState, useEffect } from 'react';
import { INavbarItem, INavbarItemsStreamParams } from 'services/navbar';
import { subscribeToStream } from 'hooks/useNavbarItems';
import { updateNavbarItem } from '../services/navbar';

export default function useNavbarItems(params?: INavbarItemsStreamParams) {
  const [navbarItems, setNavbarItems] = useState<
    INavbarItem[] | undefined | null | Error
  >(undefined);

  useEffect(subscribeToStream(params, setNavbarItems), [params?.visible]);

  return {
    navbarItems,
    onUpdateNavbarItem: updateNavbarItem,
  };
}
