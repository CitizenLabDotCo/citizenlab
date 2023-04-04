import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'file',
  variant: 'idea',
};

const ideaFilesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ ideaId }: { ideaId?: string }) => [
    { ...baseKey, operation: 'list', parameters: { ideaId } },
  ],
} satisfies QueryKeys;

export default ideaFilesKeys;
