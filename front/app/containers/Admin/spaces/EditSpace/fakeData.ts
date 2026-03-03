import { TreeNode } from './TreeView/types';

// TODO remove
export const TEST_NODE_DATA: TreeNode[] = [
  {
    id: '1',
    type: 'project',
    name: 'Some cool project',
  },
  {
    id: '2',
    type: 'project',
    name: 'Another very cool project',
  },
  {
    id: '3',
    type: 'folder',
    name: 'Folder 1',
    children: [
      {
        id: '4',
        type: 'project',
        name: 'Some nested project',
      },
      {
        id: '5',
        type: 'project',
        name: 'Another nested project',
      },
    ],
  },
  {
    id: '6',
    type: 'folder',
    name: 'Folder 2',
    children: [
      {
        id: '7',
        type: 'project',
        name: 'Some nested project',
      },
      {
        id: '8',
        type: 'project',
        name: 'Another nested project',
      },
    ],
  },
];
