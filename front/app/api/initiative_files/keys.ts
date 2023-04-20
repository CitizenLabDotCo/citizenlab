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
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({
    initiativeId,
    fileId,
  }: {
    initiativeId: string;
    fileId: string;
  }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { initiativeId, fileId },
    },
  ],
} satisfies QueryKeys;

export default initiativeFilesKeys;
