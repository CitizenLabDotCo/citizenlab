import { QueryKeys } from 'utils/cl-react-query/types';

import { OpinionGroupsParameters } from './types';

const baseKey = { type: 'opinion_groups' };

const opinionGroupsKeys = {
  all: () => [baseKey],
  item: ({
    phaseId,
    parameters,
  }: {
    phaseId?: string;
    parameters: OpinionGroupsParameters;
  }) => [
    { ...baseKey, operation: 'item', parameters: { phaseId, ...parameters } },
  ],
} satisfies QueryKeys;

export default opinionGroupsKeys;
