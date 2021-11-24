import {
  IPageNavbarItem,
  TNavbarItem,
  TRemovableDefaultNavbarItemCode,
  TNavbarItemCode,
} from 'services/navbar';
import { IPageData, TPageCode } from 'services/pages';
import { Multiloc } from 'typings';

interface IDefaultItemNotInNavbar {
  type: 'default_item';
  navbarCode: TRemovableDefaultNavbarItemCode;
}

interface IPageNotInNavbar {
  type: 'page';
  pageCode: TPageCode;
  pageId: string;
  pageTitleMultiloc: Multiloc;
}

export type IItemNotInNavbar = IDefaultItemNotInNavbar | IPageNotInNavbar;

const DEFAULT_REMOVABLE_ITEM_CODES = new Set<TNavbarItemCode>([
  'all_input',
  'proposals',
  'events',
]);

function getDefaultItemsNotInNavbar(
  navbarItems: TNavbarItem[]
): IDefaultItemNotInNavbar[] {
  return navbarItems
    .filter((navbarItem) =>
      DEFAULT_REMOVABLE_ITEM_CODES.has(navbarItem.attributes.code)
    )
    .map((navbarItem) => ({
      type: 'default_item',
      navbarCode: navbarItem.attributes.code as TRemovableDefaultNavbarItemCode,
    }));
}

const getPageId = (navbarItem: IPageNavbarItem) =>
  navbarItem.relationships.page.data.id;

function getPagesNotInNavbar(
  navbarItems: TNavbarItem[],
  pages: IPageData[]
): IPageNotInNavbar[] {
  const pageIdsInNavbarItems = new Set<string>(
    navbarItems
      .filter((navbarItem) => navbarItem.attributes.code === 'custom')
      .map((navbarItem) => getPageId(navbarItem as IPageNavbarItem))
  );

  return pages
    .filter((page) => !pageIdsInNavbarItems.has(page.id))
    .map((page) => ({
      type: 'page',
      pageCode: page.attributes.code,
      pageId: page.id,
      pageTitleMultiloc: page.attributes.title_multiloc,
    }));
}

export default function getItemsNotInNavbar(
  navbarItems: TNavbarItem[],
  pages: IPageData[]
): IItemNotInNavbar[] {
  // 'native' navbar items are all navbar items that are not pages.
  const defaultItemsNotInNavbar = getDefaultItemsNotInNavbar(navbarItems);
  const pagesNotInNavbar = getPagesNotInNavbar(navbarItems, pages);

  return [...defaultItemsNotInNavbar, ...pagesNotInNavbar];
}
