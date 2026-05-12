import { Multiloc, IRelationship, ILinks } from 'typings';

import { PublicationStatus } from 'api/projects/types';
import { IUserData } from 'api/users/types';

export type Parameters = {
  status?: PublicationStatus[];
  managers?: string[];
  search?: string;
};

type Included = IUserData[];

export interface MiniProjectFolders {
  data: MiniProjectFolder[];
  links?: ILinks;
  included?: Included;
}

export interface MiniProjectFolder {
  id: string;
  type: 'folder_mini';
  attributes: {
    title_multiloc: Multiloc;
    visible_projects_count: number;
    publication_status: PublicationStatus;
    space_id: string | null;
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
