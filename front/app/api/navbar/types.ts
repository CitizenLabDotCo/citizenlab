import { IRelationship, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import navbarKeys from './keys';

export type NavbarKeys = Keys<typeof navbarKeys>;

export type NavbarParameters = {
  onlyDefaultItems?: boolean;
  onlyRemovedDefaultItems?: boolean;
};

export type TDefaultNavbarItemCode =
  | 'home'
  | 'projects'
  | 'all_input'
  | 'events';

// 'menu' is a dropdown navbar item grouping child items under one entry.
export type TNavbarItemCode = TDefaultNavbarItemCode | 'custom' | 'menu';

// A child of a dropdown ('menu') item, serialized inline on the parent.
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
    // Only populated for 'menu' (dropdown) items.
    children: INavbarChild[];
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

// A single child of a dropdown, referencing exactly one target.
export interface INavbarDropdownChild {
  static_page_id?: string;
  project_id?: string;
  project_folder_id?: string;
}

// Atomic create/update payload for a dropdown ('menu') item and its children.
export interface INavbarDropdown {
  // Present when updating an existing dropdown.
  id?: string;
  title_multiloc: Multiloc;
  children: INavbarDropdownChild[];
}
