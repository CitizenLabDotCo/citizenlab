import { QueryKeys } from 'utils/cl-react-query/types';

import { AdminParameters, IQueryParameters } from './types';

const baseKey = {
  type: 'folder',
};

const projectFoldersKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (
    parameters: IQueryParameters | ({ admin: true } & AdminParameters)
  ) => [{ ...baseKey, operation: 'list', parameters }],
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
