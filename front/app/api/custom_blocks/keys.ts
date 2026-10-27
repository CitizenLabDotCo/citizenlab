import { QueryKeys } from 'utils/cl-react-query/types';

import { ICustomBlockVersionParams } from './types';

const baseKey = { type: 'custom_block_version' };

const customBlocksKeys = {
  all: () => [baseKey],
  // Nothing invalidates this: blocks are written by generation runs, which the
  // panels watch through their own queries. A page load refreshes the toolbox.
  lists: () => [{ ...baseKey, operation: 'list' }],
  items: () => [{ ...baseKey, operation: 'item' }],
  // A version is immutable, so id plus number is the whole identity.
  item: ({ blockId, version }: ICustomBlockVersionParams) => [
    { ...baseKey, operation: 'item', parameters: { blockId, version } },
  ],
} satisfies QueryKeys;

export default customBlocksKeys;
