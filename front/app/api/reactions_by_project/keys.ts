import { QueryKeys } from 'utils/cl-react-query/types';

import { IReactionsByProjectParams } from './types';

const baseKey = { type: 'reactions_by_project' };

const reactionsByProjectKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (params: IReactionsByProjectParams) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

export default reactionsByProjectKeys;
