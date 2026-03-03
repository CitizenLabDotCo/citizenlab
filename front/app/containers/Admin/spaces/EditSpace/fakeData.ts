import { TreeNode } from './TreeView/types';

// TODO remove
export const TEST_DATA_ADDED: TreeNode[] = [
  {
    id: '1',
    type: 'project',
    name: 'Some cool project',
    path: '/admin/projects/1',
  },
  {
    id: '2',
    type: 'project',
    name: 'Another very cool project',
    path: '/admin/projects/2',
  },
  {
    id: '3',
    type: 'folder',
    name: 'Folder in space',
    path: '/admin/projects/folders/3',
    inSpace: true,
    children: [
      {
        id: '4',
        type: 'project',
        name: 'Some nested project',
        path: '/admin/projects/4',
      },
      {
        id: '5',
        type: 'project',
        name: 'Another nested project',
        path: '/admin/projects/5',
      },
    ],
  },
  {
    id: '6',
    type: 'folder',
    name: 'Folder not in space',
    path: '/admin/projects/folders/6',
    inSpace: false,
    children: [
      {
        id: '7',
        type: 'project',
        name: 'Project in space',
        path: '/admin/projects/7',
      },
    ],
  },
];

export const TEST_DATA_CAN_BE_ADDED: TreeNode[] = [];
