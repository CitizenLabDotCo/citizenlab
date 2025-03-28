import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'custom_field_bin' };

const customFieldBinsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ customFieldId }: { customFieldId?: string }) => [
    { ...baseKey, operation: 'list', parameters: { customFieldId } },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ binId }: { customFieldId?: string; binId?: string }) => [
    { ...baseKey, operation: 'item', parameters: { id: binId } },
  ],
} satisfies QueryKeys;

export default customFieldBinsKeys;
