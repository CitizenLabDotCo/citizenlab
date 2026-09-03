import { QueryKeys } from 'utils/cl-react-query/types';

const itemKey = { type: 'content_builder_layout' };
const baseKey = { type: 'content_builder_layout', variant: 'custom_page' };

const customPageLayoutKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ staticPageId }: { staticPageId?: string }) => [
    {
      ...itemKey,
      operation: 'item',
      parameters: { staticPageId, code: 'custom_page' },
    },
  ],
} satisfies QueryKeys;

export default customPageLayoutKeys;
