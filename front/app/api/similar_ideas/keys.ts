import { QueryKeys } from 'utils/cl-react-query/types';

import { ISimilarityRequestPayload } from './types';

const baseKey = {
  type: 'similarIdea',
};

const similarIdeasKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (payload: ISimilarityRequestPayload) => [
    {
      ...baseKey,
      operation: 'list',
      parameters: {
        title: payload.idea.title_multiloc ?? '',
        body: payload.idea.body_multiloc ?? '',
        phaseId: payload.phase_id,
      },
    },
  ],
} satisfies QueryKeys;

export default similarIdeasKeys;
