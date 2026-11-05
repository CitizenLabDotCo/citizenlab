import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'content_builder_layout' };

const contentBuilderKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ contentBuildableId }: { contentBuildableId: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { contentBuildableId },
    },
  ],
} satisfies QueryKeys;

export default contentBuilderKeys;
