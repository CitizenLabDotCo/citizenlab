type ProjectNode = {
  id: string;
  type: 'project';
  name: string;
};

export type FolderNode = {
  id: string;
  type: 'folder';
  name: string;
  children: ProjectNode[];
};

export type TreeNode = ProjectNode | FolderNode;
