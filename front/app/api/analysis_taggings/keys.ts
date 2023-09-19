import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'analysis_tagging' };

const taggingKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ analysisId }: { analysisId: string }) => [
    {
      ...baseKey,
      operation: 'list',
      analysisId,
      parameters: { analysisId },
    },
  ],
} satisfies QueryKeys;

export default taggingKeys;
