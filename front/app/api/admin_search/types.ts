import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import adminSearchKeys from './keys';

export type AdminSearchKeys = Keys<typeof adminSearchKeys>;

export type AdminSearchProject = {
  id: string;
  type: 'project_admin_search';
  attributes: {
    title_multiloc: Multiloc;
    folder_id: string | null;
    folder_title_multiloc: Multiloc | null;
    phases: { id: string; title_multiloc: Multiloc }[];
  };
};

export type AdminSearchFolder = {
  id: string;
  type: 'folder_admin_search';
  attributes: { title_multiloc: Multiloc };
};

export type AdminSearchSpace = {
  id: string;
  type: 'space_admin_search';
  attributes: { title_multiloc: Multiloc };
};

export type AdminSearchItem =
  | AdminSearchProject
  | AdminSearchFolder
  | AdminSearchSpace;

export interface IAdminSearch {
  data: AdminSearchItem[];
}
