import { IRelationship, Multiloc } from 'typings';

import { IProjectFolderData } from 'api/project_folders/types';
import { IProjectData } from 'api/projects/types';
import { IUserData } from 'api/users/types';

import { Keys } from 'utils/cl-react-query/types';

import spacesKeys from './keys';

export type SpacesKeys = Keys<typeof spacesKeys>;

export interface Space {
  data: SpaceData;
  included?: (IProjectFolderData | IProjectData)[];
}

// The spaces list also counts what is in each space.
export type SpaceListData = SpaceData & {
  attributes: { folders_count: number; projects_count: number };
};

export interface Spaces {
  data: SpaceListData[];
  included?: IUserData[];
}

export interface SpaceData {
  id: string;
  type: 'space';
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    // Where admins put the space among the others.
    ordering: number;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    folders?: {
      data: IRelationship[];
    };
    projects?: {
      data: IRelationship[];
    };
    moderators: {
      data: IRelationship[];
    };
  };
}

export interface RequestBody {
  title_multiloc: Multiloc;
  description_multiloc?: Multiloc;
}
