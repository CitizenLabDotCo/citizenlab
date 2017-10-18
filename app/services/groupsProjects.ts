import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';

export interface IGroupsProjectsData {
  id: string;
  type: 'groups_projects';
  relationships: {
    group: {
      data: string;
      type: 'groups';
    }
  };
}

export interface IGroupsProjects {
  data: IGroupsProjectsData;
}

export function groupsProjectsByIdStream(groupsProjectsId: string) {
  return streams.get<IGroupsProjects>({ apiEndpoint: `${API_PATH}/groups_projects/${groupsProjectsId}` });
}

export function groupsProjectsByProjectIdStream(projectId: string) {
  return streams.get<IGroupsProjects>({ apiEndpoint: `${API_PATH}projects/${projectId}/groups_projects` });
}
