import { IRelationship, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import navbarKeys from './keys';

export type NavbarKeys = Keys<typeof navbarKeys>;

export type NavbarParameters = {
  onlyRemovedDefaultItems?: boolean;
  // Client-side only: whether to truncate titles to the navbar display length.
  // Defaults to true; not sent to the backend.
  truncateTitles?: boolean;
};

export type TDefaultNavbarItemCode =
  | 'home'
  | 'projects'
  | 'all_input'
  | 'events';

export type TNavbarItemCode = TDefaultNavbarItemCode | 'custom';

export interface INavbarChild {
  id: string;
  title_multiloc: Multiloc;
  slug: string | null;
  static_page_id: string | null;
  project_id: string | null;
  project_folder_id: string | null;
}

export interface INavbarItem {
  id: string;
  type: 'nav_bar_item';
  attributes: {
    title_multiloc: Multiloc;
    code: TNavbarItemCode;
    slug: string | null;
    ordering: number;
    children?: INavbarChild[];
    created_at: string;
    updated_at: string;
  };
  relationships: {
    static_page: {
      data: IRelationship | null;
    };
    project: {
      data: IRelationship | null;
    };
    project_folder: {
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
  project_id?: string;
  project_folder_id?: string;
}

export interface INavbarItemUpdate {
  id: string;
  title_multiloc?: Multiloc;
}

export interface INavbarDropdownChild {
  static_page_id?: string;
  project_id?: string;
  project_folder_id?: string;
}

export interface INavbarDropdown {
  id?: string;
  title_multiloc: Multiloc;
  children: INavbarDropdownChild[];
}
