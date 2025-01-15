import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'custom_form' };

const customFormKeys = {
  all: () => [baseKey],
  item: (params: { projectId: string; phaseId?: string }) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

export default customFormKeys;
