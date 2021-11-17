import { INavbarItem, TNavbarItemCode } from 'services/navbar';
import { IPageData, TPageCode } from 'services/pages';
import { Multiloc } from 'typings';

interface IDefaultItemNotInNavbar {
  type: 'default_item';
  navbarCode: TNavbarItemCode;
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

type TDefaultRemovableItemMap = Partial<Record<TNavbarItemCode, INavbarItem>>;

function getDefaultItemsNotInNavbar(
  navbarItems: INavbarItem[]
): IDefaultItemNotInNavbar[] {
  const defaultRemovableItemMap: TDefaultRemovableItemMap = navbarItems.reduce(
    (acc, curr) => {
      if (!DEFAULT_REMOVABLE_ITEM_CODES.has(curr.attributes.code)) {
        return acc;
      }

      return { ...acc, [curr.attributes.code]: curr };
    },
    {}
  );

  return [...DEFAULT_REMOVABLE_ITEM_CODES]
    .filter((code) => defaultRemovableItemMap[code])
    .map((code) => ({
      type: 'default_item',
      navbarCode: defaultRemovableItemMap[code]!.attributes.code,
    }));
}

function getPagesNotInNavbar(
  navbarItems: INavbarItem[],
  pages: IPageData[]
): IPageNotInNavbar[] {
  const pageIdsInNavbarItems = new Set<string>(
    navbarItems.reduce((acc, curr) => {
      if (!curr.relationships.page) return acc;
      return [...acc, curr.relationships.page.data.id];
    }, [])
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
  navbarItems: INavbarItem[],
  pages: IPageData[]
): IItemNotInNavbar[] {
  // 'native' navbar items are all navbar items that are not pages.
  const defaultItemsNotInNavbar = getDefaultItemsNotInNavbar(navbarItems);
  const pagesNotInNavbar = getPagesNotInNavbar(navbarItems, pages);

  return [...defaultItemsNotInNavbar, ...pagesNotInNavbar];
}
