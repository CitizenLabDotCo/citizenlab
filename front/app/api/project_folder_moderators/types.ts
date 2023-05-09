import { Keys } from 'utils/cl-react-query/types';
import projectFolderModeratorsKeys from './keys';

export type ProjectFolderModeratorsKeys = Keys<
  typeof projectFolderModeratorsKeys
>;

export type ProjectForderParams = {
  projectFolderId: string;
};
