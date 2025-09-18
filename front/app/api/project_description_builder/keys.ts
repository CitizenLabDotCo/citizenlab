import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'project_description_builder' };

const projectDescriptionBuilderKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ modelId }: { modelId: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { modelId },
    },
  ],
} satisfies QueryKeys;

export default projectDescriptionBuilderKeys;
