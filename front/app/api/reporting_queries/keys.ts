import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'reporting_query' };

const reportingQueryKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ query }: { query: string }) => [
    { ...baseKey, operation: 'item', parameters: { query } },
  ],
} satisfies QueryKeys;

export default reportingQueryKeys;
