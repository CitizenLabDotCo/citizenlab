import { Multiloc, IRelationship, Pagination, ILinks } from 'typings';

import { PublicationStatus } from 'api/projects/types';

import { Keys } from 'utils/cl-react-query/types';

import projectFoldersKeys from './keys';

export type ProjectFoldersMiniKeys = Keys<typeof projectFoldersKeys>;

export type Parameters = {
  status?: PublicationStatus[];
  managers?: string[];
  search?: string;
} & Pagination;

export interface MiniProjectFolders {
  data: MiniProjectFolder[];
  links?: ILinks;
}

export interface MiniProjectFolder {
  id: string;
  type: 'folder_mini';
  attributes: {
    title_multiloc: Multiloc;
    visible_projects_count: number;
    publication_status: PublicationStatus;
  };
  relationships: {
    moderators: {
      data: IRelationship[];
    };
  };
}
