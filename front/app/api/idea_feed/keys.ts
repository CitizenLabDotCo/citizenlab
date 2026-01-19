import { QueryKeys } from 'utils/cl-react-query/types';

import { IIdeaFeedQueryParameters } from './types';

const baseKey = {
  type: 'idea_feed',
};

const ideaFeedKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({
    phaseId,
    ...parameters
  }: IIdeaFeedQueryParameters & { phaseId: string }) => [
    { ...baseKey, operation: 'list', parameters: { phaseId, ...parameters } },
  ],
} satisfies QueryKeys;

export default ideaFeedKeys;
