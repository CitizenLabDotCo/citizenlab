import { QueryKeys } from 'utils/cl-react-query/types';

import { ICustomBlocksParams } from './types';

const baseKey = { type: 'custom_block' };

const customBlocksKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: ICustomBlocksParams) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string }) => [
    { ...baseKey, operation: 'item', parameters: { id } },
  ],
} satisfies QueryKeys;

export default customBlocksKeys;
