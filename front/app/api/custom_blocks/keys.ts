import { QueryKeys } from 'utils/cl-react-query/types';

import { ICustomBlockVersionParams } from './types';

const baseKey = { type: 'custom_block_version' };

const customBlocksKeys = {
  all: () => [baseKey],
  // The toolbox's list of published blocks. Blocks are only written by generation
  // runs, which the panels watch through their own queries, so nothing here
  // invalidates it; a page load is what refreshes the toolbox.
  lists: () => [{ ...baseKey, operation: 'list' }],
  items: () => [{ ...baseKey, operation: 'item' }],
  // A version is immutable, and a layout pins the one it renders, so the block
  // id and the version number together are the whole identity.
  item: ({ blockId, version }: ICustomBlockVersionParams) => [
    { ...baseKey, operation: 'item', parameters: { blockId, version } },
  ],
} satisfies QueryKeys;

export default customBlocksKeys;
