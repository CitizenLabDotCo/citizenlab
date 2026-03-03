import { RouteType } from 'routes';

type State = 'blocked' | 'removable' | 'addable';

export type ProjectNode = {
  id: string;
  type: 'project';
  name: string;
  path: RouteType;
  state: State;
};

export type FolderNode = {
  id: string;
  type: 'folder';
  name: string;
  path: RouteType;
  children: ProjectNode[];
  state: State;
};

export type TreeNode = ProjectNode | FolderNode;
