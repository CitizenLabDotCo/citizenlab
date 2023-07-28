import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'file',
  variant: 'page',
};

const pageFilesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ pageId }: { pageId?: string }) => [
    { ...baseKey, operation: 'list', parameters: { pageId } },
  ],
} satisfies QueryKeys;

export default pageFilesKeys;
