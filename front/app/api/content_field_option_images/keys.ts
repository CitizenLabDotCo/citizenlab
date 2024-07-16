import { QueryKeys } from 'utils/cl-react-query/types';

const itemKey = { type: 'image' };
const baseKey = { type: 'image', variant: 'custom_field_option_image' };

const customFieldOptionKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string }) => [
    {
      ...itemKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default customFieldOptionKeys;
