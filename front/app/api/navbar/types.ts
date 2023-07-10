import { Keys } from 'utils/cl-react-query/types';
import navbarKeys from './keys';
import { IRelationship, Multiloc } from 'typings';

export type NavbarKeys = Keys<typeof navbarKeys>;

export type NavbarParameters = {
  onlyDefaultItems?: boolean;
  onlyRemovedDefaultItems?: boolean;
};

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

export interface INavbarItemResponse {
  data: INavbarItem;
}

export interface INavbarItems {
  data: INavbarItem[];
}

export interface INavbarItemAdd {
  code: TNavbarItemCode;
  static_page_id?: string;
  title_multiloc?: Multiloc;
}

export interface INavbarItemUpdate {
  id: string;
  title_multiloc?: Multiloc;
}
