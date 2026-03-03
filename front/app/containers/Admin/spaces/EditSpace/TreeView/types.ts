type ProjectNode = {
  id: string;
  type: 'project';
  name: string;
};

type FolderNode = {
  id: string;
  type: 'folder';
  name: string;
  children: ProjectNode[];
};

export type TreeNode = ProjectNode | FolderNode;
