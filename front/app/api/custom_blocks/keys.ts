import { QueryKeys } from 'utils/cl-react-query/types';

import { ICustomBlockVersionParams } from './types';

const baseKey = { type: 'custom_block_version' };

const customBlocksKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  // A version is immutable, so id plus number is the whole identity.
  item: ({ blockId, version }: ICustomBlockVersionParams) => [
    { ...baseKey, operation: 'item', parameters: { blockId, version } },
  ],
} satisfies QueryKeys;

export default customBlocksKeys;
