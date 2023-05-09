import { QueryKeys } from 'utils/cl-react-query/types';
import { IQueryParameters } from './types';

const baseKey = {
  type: 'project_folder_file',
};

const projectFolderFilesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: IQueryParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
} satisfies QueryKeys;

export default projectFolderFilesKeys;
