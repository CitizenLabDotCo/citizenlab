import { QueryKeys } from 'utils/cl-react-query/types';

import { IQueryParameters } from './types';

const baseKey = {
  type: 'invite',
};

const invitesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: IQueryParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default invitesKeys;
