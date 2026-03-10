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
];
