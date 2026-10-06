import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'reporting_query' };

const reportingQueryKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ query, layoutId }: { query: string; layoutId?: string }) => [
    { ...baseKey, operation: 'item', parameters: { query, layoutId } },
  ],
} satisfies QueryKeys;

export default reportingQueryKeys;
