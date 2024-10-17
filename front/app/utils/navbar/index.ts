import { Multiloc } from 'typings';

import { ICustomPageData, TCustomPageCode } from 'api/custom_pages/types';
import { INavbarItem, TNavbarItemCode } from 'api/navbar/types';

interface IDefaultItemNotInNavbar {
  type: 'default_item';
  navbarCode: TNavbarItemCode;
  navbarId: string;
  titleMultiloc: Multiloc;
  slug: string | null;
}

interface ICustomPageNotInNavbar {
  type: 'page';
  pageCode: TCustomPageCode;
  pageId: string;
  titleMultiloc: Multiloc;
  slug: string | null;
}

interface IProjectNotInNavbar {
  type: 'project';
  projectId: string;
  titleMultiloc: Multiloc;
  slug: string | null;
}

export type IItemNotInNavbar =
  | IDefaultItemNotInNavbar
  | ICustomPageNotInNavbar
  | IProjectNotInNavbar;

function getDefaultItemsNotInNavbar(
  removedDefaultNavbarItems: INavbarItem[]
): IDefaultItemNotInNavbar[] {
  return removedDefaultNavbarItems.map((navbarItem) => ({
    type: 'default_item',
    navbarCode: navbarItem.attributes.code,
    navbarId: navbarItem.id,
    titleMultiloc: navbarItem.attributes.title_multiloc,
    slug: navbarItem.attributes.slug,
  }));
}

function getPagesNotInNavbar(
  navbarItems: INavbarItem[],
  pages: ICustomPageData[]
): ICustomPageNotInNavbar[] {
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
      titleMultiloc: page.attributes.nav_bar_item_title_multiloc,
      slug: page.attributes.slug,
    }));
}

export default function getItemsNotInNavbar(
  navbarItems: INavbarItem[],
  removedDefaultNavbarItems: INavbarItem[],
  pages: ICustomPageData[]
): IItemNotInNavbar[] {
  // 'default' navbar items are all navbar items that are not pages.
  const defaultItemsNotInNavbar = getDefaultItemsNotInNavbar(
    removedDefaultNavbarItems
  );
  const pagesNotInNavbar = getPagesNotInNavbar(navbarItems, pages);

  return [...defaultItemsNotInNavbar, ...pagesNotInNavbar];
}
