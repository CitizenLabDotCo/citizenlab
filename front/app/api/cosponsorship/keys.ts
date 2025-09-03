import { QueryKeys } from 'utils/cl-react-query/types';

import { ICosponsorshipParameters } from './types';

const baseKey = { type: 'cosponsorship' };

const cosponsorshipKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: ICosponsorshipParameters) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
} satisfies QueryKeys;

export default cosponsorshipKeys;
