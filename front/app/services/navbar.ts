import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export const apiEndpoint = `${API_PATH}/nav_bar_items`;

export type TNavbarItemCode =
  | 'home'
  | 'projects'
  | 'all_input'
  | 'proposals'
  | 'events'
  | 'custom';

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
    apiEndpoint: `${apiEndpoint}`,
  });
}
