import { Multiloc } from 'typings';
import streams from 'utils/streams';
import { apiEndpoint, INavbarItem, TNavbarItemCode } from 'services/navbar';
import { IItemNotInNavbar } from '../admin/containers/getItemsNotInNavbar';

interface INavbarItemAdd {
  code: TNavbarItemCode;
  page_id?: string;
  title_multiloc?: Multiloc;
}

interface INavbarItemUpdate {
  title_multiloc?: Multiloc;
}

export async function addNavbarItem(item: IItemNotInNavbar) {
  const navbarItem: INavbarItemAdd =
    item.type === 'default_item'
      ? {
          code: item.navbarCode,
          title_multiloc: undefined, // TODO
        }
      : {
          code: 'custom',
          page_id: item.pageId,
        };

  return streams.add<INavbarItem>(apiEndpoint, { nav_bar_item: navbarItem });
}

export async function updateNavbarItem(
  navbarItemId: string,
  navbarItemUpdate: INavbarItemUpdate
) {
  return streams.update<INavbarItem>(
    `${apiEndpoint}/${navbarItemId}`,
    navbarItemId,
    { nav_bar_item: navbarItemUpdate }
  );
}

export async function reorderNavbarItem(
  navbarItemId: string,
  navbarItemOrdering: number
) {
  return streams.update<INavbarItem>(
    `${apiEndpoint}/${navbarItemId}/reorder`,
    navbarItemId,
    { nav_bar_item: { ordering: navbarItemOrdering } }
  );
}

export async function removeNavbarItem(navbarItemId) {
  return streams.delete(`${apiEndpoint}/${navbarItemId}`, navbarItemId);
}
