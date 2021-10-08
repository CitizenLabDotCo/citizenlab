import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export const apiEndpoint = `${API_PATH}/navbar_items`;

type TNavbarItemType =
  | 'home'
  | 'projects'
  | 'all_input'
  | 'proposals'
  | 'events'
  | 'custom';

export interface INavbarItem {
  id: string;
  type: 'navbar_item';
  attributes: {
    type: TNavbarItemType;
    title_multiloc: Multiloc;
    visible: boolean;
    ordering: number;
  };
  relationships: {
    page: {
      data: IRelationship;
    };
  };
}

export interface INavbarItemsStreamParams {
  visible?: boolean;
}

export function navbarItemsStream(
  navbarItemsStreamParams?: INavbarItemsStreamParams
) {
  return streams.get<{ data: INavbarItem[] }>({
    apiEndpoint: `${apiEndpoint}`,
    queryParameters: navbarItemsStreamParams,
  });
}
