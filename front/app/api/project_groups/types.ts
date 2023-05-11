import projectGroupsKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

export type ProjectGroupsKeys = Keys<typeof projectGroupsKeys>;

export type IProjectGroupsParams = {
  projectId: string;
};

export type IProjectGroupsAdd = {
  groupId: string;
  projectId: string;
};

export interface IProjectGroupData {
  id: string;
  type: 'groups_project';
  relationships: {
    group: {
      data: {
        id: string;
        type: 'group';
      };
    };
  };
}

export interface IProjectGroups {
  data: IProjectGroupData[];
}

export interface IProjectGroup {
  data: IProjectGroupData;
}
