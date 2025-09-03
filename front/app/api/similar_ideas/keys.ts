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
        projectId: payload.idea.project_id,
        title: payload.idea.title_multiloc ?? '',
        body: payload.idea.body_multiloc ?? '',
        phaseIds: payload.idea.phase_ids ?? [],
      },
    },
  ],
} satisfies QueryKeys;

export default similarIdeasKeys;
