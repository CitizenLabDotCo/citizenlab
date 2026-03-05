import { IProjectFolderData } from 'api/project_folders/types';
import { Space } from 'api/spaces/types';

import { TreeNode } from './TreeView/types';

export const constructTreeNodes: TreeNode[] = (space: Space) => {
  const included = space.included || [];
  if (included.length === 0) return [];

  const projectsInFolders: Record<string, IProjectFolderData[]> = {};

  included.forEach((item) => {
    if (item.type === 'folder') {
      projectsInFolders[item.id] = [];
    }
  });

  included.forEach((item) => {
    if (item.type === 'project') {
      const folderId = item.relationships.folder.data.id;
      if (projectsInFolders[folderId]) {
        projectsInFolders[folderId].push(item);
      }
    }
  });
};
