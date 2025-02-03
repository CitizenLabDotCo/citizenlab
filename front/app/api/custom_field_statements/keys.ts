import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'custom_field_matrix_statement' };

const customFieldStatementKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string }) => [
    { ...baseKey, operation: 'item', parameters: { id } },
  ],
} satisfies QueryKeys;

export default customFieldStatementKeys;
