import { IRelationship, Multiloc } from 'typings';

import { IProjectFolderData } from 'api/project_folders/types';
import { IProjectData } from 'api/projects/types';

import { Keys } from 'utils/cl-react-query/types';

import spacesKeys from './keys';

export type SpacesKeys = Keys<typeof spacesKeys>;

export interface Space {
  data: SpaceData;
  included?: (IProjectFolderData | IProjectData)[];
}

export interface Spaces {
  data: SpaceData[];
  included?: (IProjectFolderData | IProjectData)[];
}

export interface SpaceData {
  id: string;
  type: 'space';
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    folders: {
      data: IRelationship[];
    };
    projects: {
      data: IRelationship[];
    };
  };
}

export interface RequestBody {
  title_multiloc: Multiloc;
  description_multiloc?: Multiloc;
}

export type ProjectNode = {
  id: string;
  type: 'project';
  title_multiloc: Multiloc;
};

export type FolderNode = {
  id: string;
  type: 'folder';
  title_multiloc: Multiloc;
  children: ProjectNode[];
};

export type TreeNode = FolderNode | ProjectNode;

export type TreeView = {
  data: {
    type: 'tree_view';
    attributes: {
      nodes: TreeNode[];
    };
  };
};
