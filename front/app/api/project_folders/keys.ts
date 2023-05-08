import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'project_folders',
};

const projectFoldersKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id, slug }: { id?: string; slug?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id, slug },
    },
  ],
} satisfies QueryKeys;

export default projectFoldersKeys;
