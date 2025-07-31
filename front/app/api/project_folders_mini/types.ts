import { Multiloc, IRelationship, ILinks } from 'typings';

import { PublicationStatus } from 'api/projects/types';

export type Parameters = {
  status?: PublicationStatus[];
  managers?: string[];
  search?: string;
};

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
    images: {
      data: {
        id: string;
        type: 'image';
      }[];
    };
  };
}
