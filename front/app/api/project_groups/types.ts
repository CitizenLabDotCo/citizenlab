import projectGroupsKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

export type ProjectGroupsKeys = Keys<typeof projectGroupsKeys>;

export type IProjectGroupsParams = {
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
      type: 'groups_project';
    };
  };
}

export interface IProjectGroups {
  data: IProjectGroupData[];
}
