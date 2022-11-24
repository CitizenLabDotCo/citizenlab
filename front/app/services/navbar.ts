import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import { TPageSlugById } from 'hooks/useCustomPageSlugById';
import streams from 'utils/streams';
import { IItemNotInNavbar } from 'utils/navbar';

export const apiEndpoint = `${API_PATH}/nav_bar_items`;

export const DEFAULT_PAGE_SLUGS: Record<TDefaultNavbarItemCode, string> = {
  home: '/',
  projects: '/projects',
  all_input: '/ideas',
  proposals: '/initiatives',
  events: '/events',
};

export type TDefaultNavbarItemCode =
  | 'home'
  | 'projects'
  | 'all_input'
  | 'proposals'
  | 'events';

export type TNavbarItemCode = TDefaultNavbarItemCode | 'custom';

export const MAX_TITLE_LENGTH = 20;

export interface INavbarItem {
  id: string;
  type: 'nav_bar_item';
  attributes: {
    title_multiloc: Multiloc;
    code: TNavbarItemCode;
    ordering: number;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    static_page: {
      data: IRelationship | null;
    };
  };
}

export function navbarItemsStream({ onlyDefault } = { onlyDefault: false }) {
  return streams.get<{ data: INavbarItem[] }>({
    apiEndpoint,
    queryParameters: { only_default: onlyDefault },
  });
}

// utility function to get slug associated with navbar item
export function getNavbarItemSlug(
  navbarItemCode: TNavbarItemCode,
  pageBySlugId: TPageSlugById,
  pageId?: string
) {
  // Default navbar item
  if (navbarItemCode !== 'custom' && !pageId) {
    return DEFAULT_PAGE_SLUGS[navbarItemCode];
  }

  // Page navbar item
  if (navbarItemCode === 'custom' && pageId) {
    return pageBySlugId[pageId];
  }

  // This is impossible, but I can't seem to make typescript understand
  // that. So just returning null here
  return null;
}

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

  streams.fetchAllWith({
    partialApiEndpoint: ['nav_bar_items', 'static_pages'],
  });

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

  streams.fetchAllWith({
    partialApiEndpoint: ['nav_bar_items', 'static_pages'],
  });
  return response;
}
