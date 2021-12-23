import { Multiloc } from 'typings';
import streams from 'utils/streams';
import { apiEndpoint, INavbarItem, TNavbarItemCode } from 'services/navbar';
import { IItemNotInNavbar } from '../admin/containers/HiddenNavbarItemList/getItemsNotInNavbar';

interface INavbarItemAdd {
  code: TNavbarItemCode;
  static_page_id?: string;
  title_multiloc?: Multiloc;
}

export interface INavbarItemUpdate {
  title_multiloc?: Multiloc;
}

export function removedDefaultNavbarItems() {
  return streams.get<{ data: INavbarItem[] }>({
    apiEndpoint: `${apiEndpoint}/removed_default_items`,
  });
}

export async function addNavbarItem(item: IItemNotInNavbar) {
  const navbarItem: INavbarItemAdd =
    item.type === 'default_item'
      ? {
          code: item.navbarCode,
          title_multiloc: item.navbarTitleMultiloc,
        }
      : {
          code: 'custom',
          static_page_id: item.pageId,
          title_multiloc: item.pageTitleMultiloc,
        };

  const response = await streams.add<INavbarItem>(
    apiEndpoint,
    {
      nav_bar_item: navbarItem,
    },
    false,
    false
  );

  streams.fetchAllWith({ partialApiEndpoint: [apiEndpoint] });

  return response;
}

export async function updateNavbarItem(
  navbarItemId: string,
  navbarItemUpdate: INavbarItemUpdate
) {
  const response = await streams.update<INavbarItem>(
    `${apiEndpoint}/${navbarItemId}`,
    navbarItemId,
    { nav_bar_item: navbarItemUpdate }
  );

  await streams.fetchAllWith({ partialApiEndpoint: [apiEndpoint] });

  return response;
}

export async function reorderNavbarItem(
  navbarItemId: string,
  navbarItemOrdering: number
) {
  const response = await streams.update<INavbarItem>(
    `${apiEndpoint}/${navbarItemId}/reorder`,
    navbarItemId,
    { nav_bar_item: { ordering: navbarItemOrdering } }
  );

  streams.fetchAllWith({ partialApiEndpoint: [apiEndpoint] });

  return response;
}

export async function removeNavbarItem(navbarItemId) {
  const response = await streams.delete(
    `${apiEndpoint}/${navbarItemId}`,
    navbarItemId
  );

  streams.fetchAllWith({ partialApiEndpoint: [apiEndpoint] });

  return response;
}
