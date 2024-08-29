import { QueryKeys } from 'utils/cl-react-query/types';

import { IIdeasFilterCountsQueryParameters } from './types';

const itemKey = { type: 'filter_counts' };
const baseKey = {
  type: 'filter_counts',
  variant: 'idea',
};

const ideaFilterCountsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (parameters: IIdeasFilterCountsQueryParameters) => [
    { ...itemKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;

export default ideaFilterCountsKeys;
