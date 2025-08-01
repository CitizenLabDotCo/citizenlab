import { QueryKeys } from 'utils/cl-react-query/types';

import { Parameters } from './types';

const baseKey = {
  type: 'folder_mini',
};

const projectFoldersKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: Parameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default projectFoldersKeys;
