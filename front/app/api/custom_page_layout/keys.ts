import { QueryKeys } from 'utils/cl-react-query/types';

// An item is the same layout row however it was reached, so its key carries no variant —
// the codebase's convention for a keyed variant, and what ItemKeyDefinition enforces.
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
