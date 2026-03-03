import { TreeNode } from './TreeView/types';

// TODO remove
export const TEST_NODE_DATA: TreeNode[] = [
  {
    id: '1',
    type: 'project',
    name: 'Some cool project',
    path: '/admin/projects/1',
    state: 'removable',
  },
  {
    id: '2',
    type: 'project',
    name: 'Another very cool project',
    path: '/admin/projects/2',
    state: 'removable',
  },
  {
    id: '3',
    type: 'folder',
    name: 'Folder in space',
    path: '/admin/projects/folders/3',
    state: 'removable',
    children: [
      {
        id: '4',
        type: 'project',
        name: 'Some nested project',
        path: '/admin/projects/4',
        state: 'locked',
      },
      {
        id: '5',
        type: 'project',
        name: 'Another nested project',
        path: '/admin/projects/5',
        state: 'locked',
      },
    ],
  },
  {
    id: '6',
    type: 'folder',
    name: 'Folder not in space',
    path: '/admin/projects/folders/6',
    state: 'crossed-out',
    children: [
      {
        id: '7',
        type: 'project',
        name: 'Project in space',
        path: '/admin/projects/7',
        state: 'removable',
      },
    ],
  },
];
