import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'custom_field_statement' };

const customFieldStatementKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (params: { id?: string }) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

export default customFieldStatementKeys;
