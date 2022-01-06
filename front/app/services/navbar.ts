import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import { TPageSlugById } from 'hooks/usePageSlugById';
import streams from 'utils/streams';

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

export function navbarItemsStream() {
  return streams.get<{ data: INavbarItem[] }>({
    apiEndpoint,
  });
}

// These services are used for the toggles in admin/settings/customize and
// admin/initiatives. These toggles are only visible if the navbar module
// is disabled, so that even open source users have some minimal control
// over the navbar.
export async function toggleAllInput({ enabled }: { enabled: boolean }) {
  const response = await streams.add(`${apiEndpoint}/toggle_all_input`, {
    enabled,
  });
  await streams.fetchAllWith({ partialApiEndpoint: [apiEndpoint] });
  return response;
}

export async function toggleProposals({ enabled }: { enabled: boolean }) {
  const response = await streams.add(`${apiEndpoint}/toggle_proposals`, {
    enabled,
  });
  await streams.fetchAllWith({ partialApiEndpoint: [apiEndpoint] });
  return response;
}

export async function toggleEvents({ enabled }: { enabled: boolean }) {
  const response = await streams.add(`${apiEndpoint}/toggle_events`, {
    enabled,
  });
  await streams.fetchAllWith({ partialApiEndpoint: [apiEndpoint] });
  return response;
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
