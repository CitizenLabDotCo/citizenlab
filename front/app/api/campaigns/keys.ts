import { QueryKeys } from 'utils/cl-react-query/types';

import { QueryParameters } from './types';

const baseKey = { type: 'campaign' };

const campaignsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: QueryParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  item: ({ campaignId }: { campaignId: string | null }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id: campaignId },
    },
  ],
} satisfies QueryKeys;

export default campaignsKeys;
