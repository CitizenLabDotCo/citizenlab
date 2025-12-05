import { QueryKeys } from 'utils/cl-react-query/types';

import { IParameters } from './types';

const baseKey = {
  type: 'user_participation_stats',
};

const userParticipationStatsKeys = {
  all: () => [baseKey],
  item: (parameters: IParameters) => [
    { ...baseKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;

export default userParticipationStatsKeys;
