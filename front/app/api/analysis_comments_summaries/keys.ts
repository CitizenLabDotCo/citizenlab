import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'comments_summary' };

const commentsSummariesKeys = {
  all: () => [baseKey],
  item: ({ analysisId, inputId }: { analysisId: string; inputId: string }) => [
    { ...baseKey, operation: 'item', parameters: { analysisId, inputId } },
  ],
} satisfies QueryKeys;

export default commentsSummariesKeys;
