import { QueryKeys } from 'utils/cl-react-query/types';
import { IQueryParameters } from './types';

const baseKey = {
  type: 'image',
  variant: 'folder',
};

const projectFolderImagesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: IQueryParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default projectFolderImagesKeys;
