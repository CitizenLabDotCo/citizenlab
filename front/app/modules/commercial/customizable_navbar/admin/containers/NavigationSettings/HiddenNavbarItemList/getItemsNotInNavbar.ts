import { INavbarItem, TNavbarItemCode } from 'services/navbar';
import { IPageData, TPageCode } from 'services/pages';
import { Multiloc } from 'typings';

interface IDefaultItemNotInNavbar {
  type: 'default_item';
  navbarCode: TNavbarItemCode;
  navbarId: string;
  navbarTitleMultiloc: Multiloc;
}

interface IPageNotInNavbar {
  type: 'page';
  pageCode: TPageCode;
  pageId: string;
  pageTitleMultiloc: Multiloc;
}

export type IItemNotInNavbar = IDefaultItemNotInNavbar | IPageNotInNavbar;

function getDefaultItemsNotInNavbar(
  removedDefaultNavbarItems: INavbarItem[]
): IDefaultItemNotInNavbar[] {
  return removedDefaultNavbarItems.map((navbarItem) => ({
    type: 'default_item',
    navbarCode: navbarItem.attributes.code,
    navbarId: navbarItem.id,
    navbarTitleMultiloc: navbarItem.attributes.title_multiloc,
  }));
}

function getPagesNotInNavbar(
  navbarItems: INavbarItem[],
  pages: IPageData[]
): IPageNotInNavbar[] {
  const pageIdsInNavbarItems = new Set<string>(
    navbarItems.reduce((acc, navbarItem) => {
      if (!navbarItem.relationships.static_page.data) return acc;
      return [...acc, navbarItem.relationships.static_page.data.id];
    }, [])
  );

  return pages
    .filter((page) => !pageIdsInNavbarItems.has(page.id))
    .map((page) => ({
      type: 'page',
      pageCode: page.attributes.code,
      pageId: page.id,
      pageTitleMultiloc: page.attributes.nav_bar_item_title_multiloc,
    }));
}

export default function getItemsNotInNavbar(
  navbarItems: INavbarItem[],
  removedDefaultNavbarItems: INavbarItem[],
  pages: IPageData[]
): IItemNotInNavbar[] {
  // 'default' navbar items are all navbar items that are not pages.
  const defaultItemsNotInNavbar = getDefaultItemsNotInNavbar(
    removedDefaultNavbarItems
  );
  const pagesNotInNavbar = getPagesNotInNavbar(navbarItems, pages);

  return [...defaultItemsNotInNavbar, ...pagesNotInNavbar];
}
