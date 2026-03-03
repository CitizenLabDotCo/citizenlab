import { RouteType } from 'routes';

export type ProjectNode = {
  id: string;
  type: 'project';
  name: string;
  path: RouteType;
};

export type FolderNode = {
  id: string;
  type: 'folder';
  name: string;
  path: RouteType;
  children: ProjectNode[];
  inSpace: boolean;
};

export type TreeNode = ProjectNode | FolderNode;
