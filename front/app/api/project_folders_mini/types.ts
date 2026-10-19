import { Multiloc, IRelationship, ILinks } from 'typings';

import { PublicationStatus } from 'api/projects/types';
import { IUserData } from 'api/users/types';

export type Parameters = {
  status?: PublicationStatus[];
  managers?: string[];
  search?: string;
  space_ids?: string[];
  top_level?: boolean;
  sort?: 'arranged';
};

type Included = IUserData[];

export interface MiniProjectFolders {
  data: MiniProjectFolder[];
  links?: ILinks;
  included?: Included;
  meta: { total: number };
}

export interface MiniProjectFolder {
  id: string;
  type: 'folder_mini';
  attributes: {
    title_multiloc: Multiloc;
    visible_projects_count: number;
    publication_status: PublicationStatus;
    // The folder's place among the items beside it, and the publication that
    // holds it, which is what moving it changes.
    admin_publication_id: string;
    ordering: number;
    space_id: string | null;
    space_title_multiloc: Multiloc | null;
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
