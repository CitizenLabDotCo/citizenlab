import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'file',
  variant: 'initiative',
};

const initiativeFilesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ initiativeId }: { initiativeId: string }) => [
    { ...baseKey, operation: 'list', parameters: { initiativeId } },
  ],
} satisfies QueryKeys;

export default initiativeFilesKeys;
