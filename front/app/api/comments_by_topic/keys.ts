import { QueryKeys } from 'utils/cl-react-query/types';

import { ICommentsByTopicParams } from './types';

const baseKey = { type: 'comments_by_topic' };

const commentsByTopicKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (params: ICommentsByTopicParams) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

export default commentsByTopicKeys;
