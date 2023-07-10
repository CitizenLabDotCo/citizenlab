import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export const apiEndpoint = `${API_PATH}/nav_bar_items`;

export type TDefaultNavbarItemCode =
  | 'home'
  | 'projects'
  | 'all_input'
  | 'proposals'
  | 'events';

export type TNavbarItemCode = TDefaultNavbarItemCode | 'custom';

export const MAX_TITLE_LENGTH = 25;

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

export interface INavbarItemUpdate {
  title_multiloc?: Multiloc;
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
