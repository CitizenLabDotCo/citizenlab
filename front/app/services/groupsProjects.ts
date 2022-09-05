import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export interface IGroupsProjectsData {
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

export interface IGroupsProjects {
  data: IGroupsProjectsData[];
}

export function groupsProjectsByProjectIdStream(projectId: string) {
  return streams.get<IGroupsProjects>({
    apiEndpoint: `${API_PATH}/projects/${projectId}/groups_projects`,
  });
}

export async function addGroupProject(projectId: string, groupId: string) {
  const bodyData = {
    groups_project: {
      group_id: groupId,
    },
  };

  return streams.add<IGroupsProjects>(
    `${API_PATH}/projects/${projectId}/groups_projects`,
    bodyData
  );
}

export async function deleteGroupProject(groupProjectId: string) {
  return streams.delete(
    `${API_PATH}/groups_projects/${groupProjectId}`,
    groupProjectId
  );
}
