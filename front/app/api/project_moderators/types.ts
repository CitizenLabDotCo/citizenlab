import { Keys } from 'utils/cl-react-query/types';
import projectModeratorsKeys from './keys';

export type ProjectModeratorsKeys = Keys<typeof projectModeratorsKeys>;

export type ProjectForderParams = {
  projectId: string;
};

export type ProjectModeratorAdd = {
  moderatorId: string;
  projectId: string;
};
