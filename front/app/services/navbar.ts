import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export const apiEndpoint = `${API_PATH}/nav_bar_items`;

export type TRemovableDefaultNavbarItemCode =
  | 'all_input'
  | 'proposals'
  | 'events';

export type TDefaultNavbarItemCode =
  | 'home'
  | 'projects'
  | TRemovableDefaultNavbarItemCode;

export type TNavbarItemCode = TDefaultNavbarItemCode | 'custom';

interface IBaseNavbarItem {
  id: string;
  type: 'nav_bar_item';
}

export interface IDefaultNavbarItem extends IBaseNavbarItem {
  attributes: {
    code: TDefaultNavbarItemCode;
    title_multiloc: Multiloc;
    visible: boolean;
    ordering: number;
  };
  relationships: {};
}

export interface IPageNavbarItem extends IBaseNavbarItem {
  attributes: {
    code: 'custom';
    title_multiloc: Multiloc;
    visible: boolean;
    ordering: number;
  };
  relationships: {
    page: { data: IRelationship };
  };
}

export type TNavbarItem = IDefaultNavbarItem | IPageNavbarItem;

export function navbarItemsStream() {
  return streams.get<{ data: TNavbarItem[] }>({
    apiEndpoint: `${apiEndpoint}`,
  });
}
