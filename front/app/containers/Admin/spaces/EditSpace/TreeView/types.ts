import { RouteType } from 'routes';

type ProjectState = 'locked' | 'removable' | 'addable';

export type ProjectNode = {
  id: string;
  type: 'project';
  name: string;
  path: RouteType;
  state: ProjectState;
};

type FolderState = 'crossed-out' | 'removable' | 'addable';

export type FolderNode = {
  id: string;
  type: 'folder';
  name: string;
  path: RouteType;
  children: ProjectNode[];
  state: FolderState;
};

export type TreeNode = ProjectNode | FolderNode;
