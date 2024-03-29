import { IQueryParameters } from 'api/admin_publications/types';

import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'status_counts',
};

const adminPublicationsStatusCountsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (parameters: IQueryParameters) => [
    { ...baseKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;

export default adminPublicationsStatusCountsKeys;
