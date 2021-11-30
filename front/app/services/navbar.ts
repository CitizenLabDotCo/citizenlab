import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export const apiEndpoint = `${API_PATH}/nav_bar_items`;

export const DEFAULT_PAGE_SLUGS: Record<TDefaultNavbarItemCode, string> = {
  home: '',
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
    page?: {
      data: IRelationship;
    };
  };
}

export function navbarItemsStream() {
  return streams.get<{ data: INavbarItem[] }>({
    apiEndpoint,
  });
}

export function removedDefaultNavbarItems() {
  return streams.get<{ data: INavbarItem[] }>({
    apiEndpoint: `${apiEndpoint}/removed_default_items`,
  });
}

export function toggleAllInput({ enabled }: { enabled: boolean }) {
  return streams.add(`${apiEndpoint}/toggle_all_input`, { enabled });
}

export function toggleProposals({ enabled }: { enabled: boolean }) {
  return streams.add(`${apiEndpoint}/toggle_proposals`, { enabled });
}

export function toggleEvents({ enabled }: { enabled: boolean }) {
  return streams.add(`${apiEndpoint}/toggle_events`, { enabled });
}

export function navbarItemIsEnabled(
  navbarItems: INavbarItem[],
  code: TDefaultNavbarItemCode
) {
  return navbarItems.some((navbarItem) => code === navbarItem.attributes.code);
}
