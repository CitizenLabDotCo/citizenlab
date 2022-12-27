import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

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

export function projectGroupsByProjectIdStream(projectId: string) {
  return streams.get<IProjectGroups>({
    apiEndpoint: `${API_PATH}/projects/${projectId}/groups_projects`,
  });
}

export async function addProjectGroup(projectId: string, groupId: string) {
  const bodyData = {
    groups_project: {
      group_id: groupId,
    },
  };

  return streams.add<IProjectGroups>(
    `${API_PATH}/projects/${projectId}/groups_projects`,
    bodyData
  );
}

export async function deleteProjectGroup(groupProjectId: string) {
  return streams.delete(
    `${API_PATH}/groups_projects/${groupProjectId}`,
    groupProjectId
  );
}
