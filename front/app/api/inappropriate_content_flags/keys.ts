import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'inappropriate_content_flag' };

const inappropriateContentFlagsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default inappropriateContentFlagsKeys;
