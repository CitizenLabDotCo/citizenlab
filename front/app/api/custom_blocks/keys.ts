import { QueryKeys } from 'utils/cl-react-query/types';

import { ICustomBlockVersionParams } from './types';

const baseKey = { type: 'custom_block_version' };

const customBlocksKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  // A version is immutable, and a layout pins the one it renders, so the block
  // id and the version number together are the whole identity.
  item: ({ blockId, version }: ICustomBlockVersionParams) => [
    { ...baseKey, operation: 'item', parameters: { blockId, version } },
  ],
} satisfies QueryKeys;

export default customBlocksKeys;
