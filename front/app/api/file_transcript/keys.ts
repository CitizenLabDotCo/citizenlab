import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'transcript',
};

const fileTranscriptKeys = {
  all: () => [baseKey],
  item: ({ id }: { id?: string | null }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default fileTranscriptKeys;
