import { QueryKeys } from 'utils/cl-react-query/types';
import { IQueryParameters } from './types';

const itemKey = { type: 'filter_counts' };
const baseKey = {
  type: 'filter_counts',
  variant: 'initiative',
};

const initiativeFilterCountsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (parameters: IQueryParameters) => [
    { ...itemKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;

export default initiativeFilterCountsKeys;
