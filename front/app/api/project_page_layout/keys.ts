import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'content_builder_layout', variant: 'project_page' };

const projectPageLayoutKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ projectId }: { projectId: string }) => [
    {
      type: 'content_builder_layout',
      operation: 'item',
      parameters: { projectId, code: 'project_page' },
    },
  ],
} satisfies QueryKeys;

export default projectPageLayoutKeys;
