import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
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

export const DEFAULT_NAVBAR_ITEM_CODES: TDefaultNavbarItemCode[] = [
  'home',
  'projects',
  'all_input',
  'proposals',
  'events',
];

export type TNavbarItemCode = TDefaultNavbarItemCode | 'custom';

export interface INavbarItem {
  id: string;
  type: 'nav_bar_item';
  attributes: {
    code: TNavbarItemCode;
    title_multiloc: Multiloc;
    visible: boolean;
    ordering: number;
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

export async function toggleAllInput({ enabled }: { enabled: boolean }) {
  const response = await streams.add(`${apiEndpoint}/toggle_all_input`, {
    enabled,
  });
  await streams.fetchAllWith({ apiEndpoint: [apiEndpoint] });
  return response;
}

export async function toggleProposals({ enabled }: { enabled: boolean }) {
  const response = await streams.add(`${apiEndpoint}/toggle_proposals`, {
    enabled,
  });
  await streams.fetchAllWith({ apiEndpoint: [apiEndpoint] });
  return response;
}

export async function toggleEvents({ enabled }: { enabled: boolean }) {
  const response = await streams.add(`${apiEndpoint}/toggle_events`, {
    enabled,
  });
  await streams.fetchAllWith({ apiEndpoint: [apiEndpoint] });
  return response;
}

export function navbarItemIsEnabled(
  navbarItems: INavbarItem[],
  code: TDefaultNavbarItemCode
) {
  return navbarItems.some((navbarItem) => code === navbarItem.attributes.code);
}
