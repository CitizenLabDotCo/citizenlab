import { QueryKeys } from 'utils/cl-react-query/types';

import { ISimilarityRequestPayload } from './types';

const baseKey = {
  type: 'similarIdea',
};

const similarIdeasKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (ideaPayload: ISimilarityRequestPayload) => [
    {
      ...baseKey,
      operation: 'list',
      parameters: ideaPayload,
    },
  ],
} satisfies QueryKeys;

export default similarIdeasKeys;
