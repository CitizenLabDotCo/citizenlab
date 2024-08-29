import { QueryKeys } from 'utils/cl-react-query/types';

import { IReactionsByTopicParams } from './types';

const baseKey = { type: 'reactions_by_topic' };

const reactionsByTopicKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (params: IReactionsByTopicParams) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

export default reactionsByTopicKeys;
