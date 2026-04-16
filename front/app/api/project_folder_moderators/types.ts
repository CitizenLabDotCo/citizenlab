import { Keys } from 'utils/cl-react-query/types';

import projectFolderModeratorsKeys from './keys';

export type ProjectFolderModeratorsKeys = Keys<
  typeof projectFolderModeratorsKeys
>;

export type ProjectForderParams = {
  projectFolderId: string;
};

export type ProjectFolderModeratorAdd = {
  user_id?: string;
  user_email?: string;
  projectFolderId: string;
};
