import { QueryKeys } from 'utils/cl-react-query/types';

import { IIdeasByTopicParams } from './types';

const baseKey = { type: 'ideas_by_topic' };

const ideasByTopicKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (params: IIdeasByTopicParams) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

export default ideasByTopicKeys;
